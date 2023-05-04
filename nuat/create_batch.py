from typing import Union
import os
import json
import yaml
import time
import numpy as np
import numpy.typing as npt
import zarr
import spikeinterface as si
from .helpers.compute_templates import compute_templates
from .helpers.compute_correlogram_data import compute_correlogram_data
from .helpers.extract_snippets import extract_snippets_in_channel_neighborhood


def create_batch(*,
    recording: si.BaseRecording,
    sorting: si.BaseSorting,
    batch_id: str,
    output_folder: str,
    unit_ids: list,
    num_channels_per_neighborhood: int,
    owner_id: str
):
    print(f'Creating nuat batch {batch_id}...')
    print(f'Output folder: {output_folder}')

    unit_ids = serialize_ids(unit_ids)
    channel_ids = serialize_ids(recording.get_channel_ids())

    # require that output folder does not exist
    if os.path.exists(output_folder):
        raise Exception(f'Output folder already exists: {output_folder}')
    
    # create the output folder
    os.makedirs(output_folder)

    # create batch_info.json
    batch_info = {
        'batch_id': batch_id,
        'channel_ids': channel_ids,
        'sampling_frequency': float(recording.get_sampling_frequency()),
        'num_frames': int(recording.get_num_frames()),
        'unit_ids': unit_ids,
        'channel_locations': serialize_channel_locations(recording.get_channel_locations())
    }
    print(f'Num. channels: {len(channel_ids)}')
    print(f'Num. units: {len(unit_ids)}')
    print(f'Num. frames: {batch_info["num_frames"]}')
    with open(f'{output_folder}/batch_info.json', 'w') as f:
        json.dump(batch_info, f, indent=2)
    
    # compute full templates
    print('Computing full templates...')
    full_templates = compute_templates(traces=recording.get_traces(), sorting=sorting)

    # determine peak channels from full templates
    print('Determining peak channels...')
    peak_channel_indices = np.argmin(np.min(full_templates, axis=1), axis=1)
    peak_channel_ids = [channel_ids[i] for i in peak_channel_indices]

    # determine channel neighborhoods from channel locations and peak channels
    print('Determining channel neighborhoods...')
    channel_neighborhoods = []
    for i, unit_id in enumerate(unit_ids):
        peak_channel_id = peak_channel_ids[i]
        peak_channel_index = channel_ids.index(peak_channel_id)
        channel_locations = recording.get_channel_locations()
        peak_channel_location = channel_locations[peak_channel_index]
        channel_distances = np.linalg.norm(channel_locations - peak_channel_location, axis=1)
        # use the closest num_channels_per_neighborhood channels
        channel_neighborhood_indices = np.argsort(channel_distances)[:num_channels_per_neighborhood]
        channel_neighborhood = [channel_ids[i] for i in channel_neighborhood_indices]
        channel_neighborhoods.append({
            'unit_id': unit_id,
            'channel_ids': channel_neighborhood,
            'channel_indices': channel_neighborhood_indices,
            'peak_channel_id': peak_channel_id
        })
    
    for unit_id in unit_ids:
        print(f'Processing unit {unit_id}...')
        unit_index = unit_ids.index(unit_id)
        unit_folder = f'{output_folder}/units/{unit_id}'
        os.makedirs(unit_folder)
        channel_neighborhood = [x for x in channel_neighborhoods if x['unit_id'] == unit_id][0]
        spike_times = sorting.get_unit_spike_train(unit_id, segment_index=0)
        spike_times_sec = spike_times / recording.get_sampling_frequency()
        autocorrelogram = compute_correlogram_data(sorting=sorting, unit_id1=unit_id, window_size_msec=100, bin_size_msec=1)
        snippets_in_neighborhood = extract_snippets_in_channel_neighborhood(traces=recording.get_traces(), times=spike_times, neighborhood=channel_neighborhood["channel_indices"], T1=30, T2=30)
        channel_neighborhood_indices = channel_neighborhood['channel_indices']
        channel_locations_in_neighborhood = np.array(recording.get_channel_locations())[channel_neighborhood_indices]

        average_waveform_in_neighborhood = np.median(snippets_in_neighborhood, axis=0)

        # spike amplitudes
        peak_channel_index_in_neighborhood = channel_neighborhood["channel_ids"].index(channel_neighborhood["peak_channel_id"])
        spike_amplitudes = np.min(snippets_in_neighborhood[:, :, peak_channel_index_in_neighborhood], axis=1)

        # write unit_info.json
        unit_info = {
            'channel_neighborhood_ids': channel_neighborhood['channel_ids'],
            'channel_neighborhood_locations': serialize_channel_locations(channel_locations_in_neighborhood),
            'peak_channel_id': channel_neighborhood['peak_channel_id'],
            'num_events': len(spike_times)
        }
        print(f'  Num. channels in neighborhood: {len(channel_neighborhood["channel_ids"])}')
        print(f'  Peak channel: {channel_neighborhood["peak_channel_id"]}')
        print(f'  Num. events: {len(spike_times)}')
        with open(f'{unit_folder}/unit_info.json', 'w') as f:
            json.dump(unit_info, f, indent=2)
        # open data.zarr
        data_zarr_fname = f'{unit_folder}/data.zarr'
        data_zarr_root_group = zarr.open(data_zarr_fname, mode="w")
        data_zarr_root_group.create_dataset("spike_times", data=spike_times_sec.astype(np.float32), chunks=(100000,))
        data_zarr_root_group.create_dataset("average_waveform_in_neighborhood", data=average_waveform_in_neighborhood.astype(np.float32), chunks=(1000, 1000))
        data_zarr_root_group.create_dataset("autocorrelogram_bin_edges_sec", data=autocorrelogram['bin_edges_sec'], chunks=(1000,))
        data_zarr_root_group.create_dataset("autocorrelogram_bin_counts", data=autocorrelogram['bin_counts'], chunks=(1000,))
        data_zarr_root_group.create_dataset("snippets_in_neighborhood", data=snippets_in_neighborhood.astype(np.float32), chunks=(1000, 100, 50))
        data_zarr_root_group.create_dataset("spike_amplitudes", data=spike_amplitudes.astype(np.float32), chunks=(10000,))
    
    # write batch.yaml
    print('Writing batch.yaml...')
    batch_yaml = {
        'batch_id': batch_id,
        'owner_id': owner_id,
        'timestamp_created': time.time(),
        'timestamp_modified': time.time()
    }

    # write description.md
    print('Writing description.md...')
    with open(f'{output_folder}/description.md', 'w') as f:
        f.write(f'# {batch_id}\n')

    with open(f'{output_folder}/batch.yaml', 'w') as f:
        yaml.dump(batch_yaml, f)
    
    print('Done creating nuat batch.')

def serialize_ids(ids: Union[list, npt.NDArray]) -> list:
    return [id if isinstance(id, str) else int(id) for id in ids]

def serialize_channel_locations(channel_locations: npt.NDArray) -> list:
    ret = []
    for m in range(channel_locations.shape[0]):
        ret.append({
            'x': float(channel_locations[m, 0]),
            'y': float(channel_locations[m, 1])
        })
    return ret