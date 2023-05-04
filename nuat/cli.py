from typing import List
import click
import nuat


@click.group(help="neural unit assessment tool command line client")
def cli():
    pass

@click.command(help='Update the summary file for the GUI')
def update_summary():
    nuat.create_summary(dir='.')

cli.add_command(update_summary)