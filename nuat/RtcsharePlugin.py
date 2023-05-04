from typing import Tuple, Union
import os
import yaml
import json
from .create_summary import create_summary, create_summary_if_sufficient_time_passed


class RtcsharePlugin:
    def initialize(context):
        context.register_service('nuat', NuatService)

class NuatService:
    def handle_query(query: dict, *, dir: str, user_id: Union[str, None]=None) -> Tuple[dict, bytes]:
        print(f'Request from user: {user_id}')
        type0 = query['type']
        
        try:
            if type0 == 'test':
                return {'success': True}, b''
            elif type0 == 'probe':
                # probe is important because we will use the probe
                # as an opportunity to update the summary if it has
                # been a while. The GUI will make a probe call on
                # initialization prior to requested the summary file.

                create_summary_if_sufficient_time_passed(dir=_get_full_path('$dir', dir=dir))

                return {'success': True}, b''
            elif type0 == 'set_batch_description':
                batch_id = query['batch_id']
                check_valid_batch_id(batch_id)
                description = query['description']

                if user_id is None:
                    raise Exception('User id not provided.')
                
                info = _get_batch_info(batch_id=batch_id, dir=dir)
                owner_id = info.get('owner_id', None)
                if owner_id is None:
                    raise Exception(f'No owner id found for batch: {batch_id}')
                if owner_id != user_id:
                    raise Exception(f'User id does not match owner id for batch: {batch_id}')
                
                description_md_path = f'$dir/batches/{batch_id}/description.md'
                description_md_full_path = _get_full_path(description_md_path, dir=dir)
                with open(description_md_full_path, 'w') as f:
                    f.write(description)
                
                return {'success': True}, b''
            elif type0 == 'set_batch_assessment':
                batch_id = query['batch_id']
                check_valid_batch_id(batch_id)
                assessment = query['assessment']

                if user_id is None:
                    raise Exception('User id not provided.')

                # be careful
                check_valid_user_id(user_id)

                path = f'$dir/batches/{batch_id}/assessments/{user_id}.json'
                full_path = _get_full_path(path, dir=dir)
                # create parent directories if they don't exist
                os.makedirs(os.path.dirname(full_path), exist_ok=True)
                with open(full_path, 'w') as f:
                    json.dump(assessment, f, indent=2)
                
                return {'success': True}, b''
            else:
                raise Exception(f'Unexpected query type: {type0}')
        except Exception as e:
            return {'success': False, 'error': str(e)}, b''

def _get_batch_info(batch_id: str, *, dir: str) -> dict:
    # for security, ensure that batch_id is a valid id
    check_valid_batch_id(batch_id)
    path = f'$dir/batches/{batch_id}/batch.yaml'
    full_path = _get_full_path(path, dir=dir)
    if not os.path.exists(full_path):
        return {}
    # load the yaml info
    with open(full_path, 'r') as f:
        text = f.read()
    info = yaml.safe_load(text)
    return info

def _set_batch_info(batch_id: str, info: dict, *, dir: str) -> None:
    # for security, ensure that batch_id is a valid id
    check_valid_batch_id(batch_id)
    path = f'$dir/batches/{batch_id}/batch.yaml'
    full_path = _get_full_path(path, dir=dir)
    text = yaml.safe_dump(info)
    with open(full_path, 'w') as f:
        f.write(text)

def _get_full_path(path: str, *, dir: str) -> str:
    if '..' in path: # for security
        raise Exception(f'Invalid path: {path}')
    if path == '$dir':
        path = dir
    elif path.startswith('$dir/'):
        if dir == 'rtcshare://':
            path = 'rtcshare://' + path[len("$dir/"):]
        else:
            path = f'{dir}/{path[len("$dir/"):]}'
    if not path.startswith('rtcshare://'):
        raise Exception(f'Invalid path: {path}')
    relpath = path[len('rtcshare://'):]
    fullpath = f'{os.environ["RTCSHARE_DIR"]}/{relpath}'
    return fullpath

def check_valid_batch_id(batch_id: str) -> None:
    if not all(c.isalnum() or c == "_" for c in batch_id):
        raise Exception(f'Invalid batch id: {batch_id}')

def check_valid_user_id(user_id: str) -> None:
    if not all(c.isalnum() or c == "_" for c in user_id):
        raise Exception(f'Invalid user id: {user_id}')