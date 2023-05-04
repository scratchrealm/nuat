import os
import json
import yaml
import time


def create_summary(dir: str):
    if not os.path.exists(f'{dir}/batches'):
        os.makedirs(f'{dir}/batches')

    batches = []
    # Iterate through all the folders in the batches directory
    folders = os.listdir(f'{dir}/batches')
    folders.sort()
    for folder in folders:
        path = f'{dir}/batches/{folder}'

        # read info from batch.yaml file
        if not os.path.exists(f'{path}/batch.yaml'):
            continue
        with open(f'{path}/batch.yaml') as f:
            info = yaml.load(f, Loader=yaml.FullLoader)
        
        # if deleted, skip
        if info.get('deleted', False):
            continue

        # read description from description.md file
        if os.path.exists(f'{path}/description.md'):
            with open(f'{path}/description.md') as f:
                description = f.read()
        else:
            description = ''
        
        title = _get_title_from_markdown(description)
        batches.append({
            'batch_id': folder,
            'title': title,
            'owner_id': info.get('owner_id', None),
            'info': info,
            'description': description
        })

    summary = {
        'batches': batches
    }
    
    # write batches to summary.json file
    with open(f'{dir}/nuat_summary.json', 'w') as f:
        json.dump(summary, f, indent=2)

def create_summary_if_sufficient_time_passed(dir: str):
    summary_fname = f'{dir}/nuat_summary.json'
    refresh_needed = False
    if not os.path.exists(summary_fname):
        refresh_needed = True
    else:
        # check if sufficient time has passed
        modification_time = os.path.getmtime(summary_fname)
        if time.time() - modification_time > 60:
            refresh_needed = True
    if refresh_needed:
        create_summary(dir=dir)

def _get_title_from_markdown(markdown: str):
    # Extract the title from the markdown
    lines = markdown.split('\n')
    for line in lines:
        if line.startswith('#'):
            # skip all the initial # characters
            return line.lstrip('#').strip()
    return ''