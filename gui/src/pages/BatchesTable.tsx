import { FunctionComponent } from "react";
import Hyperlink from "../components/Hyperlink";
import useRoute from "../useRoute";
import { BatchConfig } from "./BatchPage/BatchContext";
import './scientific-table.css';
import { Summary } from "./useSummary";

type Props = {
    summary: Summary
}

const BatchesTable: FunctionComponent<Props> = ({summary}) => {
    const {setRoute} = useRoute()

    // const mcmcMonitorBaseUrl = useMcmcMonitorBaseUrl()

    const batches = [...(summary.batches || [])]
    batches.sort((a, b) => {
        if ((a.info.timestamp_modified) && (b.info.timestamp_modified)) {
            if (a.info.timestamp_modified > b.info.timestamp_modified) return -1
            if (a.info.timestamp_modified < b.info.timestamp_modified) return 1
            return 0
        }
        else {
            return 0
        }
    })

    return (
        <div>
            <table className="scientific-table">
                <thead>
                    <tr>
                        <th>Batch</th>
                        <th>Title</th>
                        <th>Owner</th>
                        <th>Created</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {batches.map(batch => (
                        <tr key={batch.batch_id}>
                            <td>
                                <Hyperlink onClick={() => setRoute({page: 'batch', batchId: batch.batch_id})}>
                                    {batch.batch_id}
                                </Hyperlink>
                            </td>
                            <td>
                                <Hyperlink onClick={() => setRoute({page: 'batch', batchId: batch.batch_id})}>
                                    {batch.title || getTitleFromMarkdown(batch.description)}
                                </Hyperlink>
                            </td>
                            <td>
                                {batch.owner_id || ''}
                            </td>
                            <td>
                                {createTimestampCreatedText(batch.info)}
                            </td>
                            <td><span style={{fontSize: 11}}>{abbreviateString(removeFirstHeaderLineInMarkdown(batch.description), 200)}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function removeFirstHeaderLineInMarkdown(text: string) {
    const lines = text.split('\n')
    if (lines.length === 0) return ''
    if (lines[0].startsWith('# ')) {
        return lines.slice(1).join('\n')
    }
    else {
        return text
    }
}

export function getTitleFromMarkdown(markdown: string) {
    const lines = markdown.split('\n')
    for (const line of lines) {
        if (line.startsWith('#')) {
            // # skip all the initial # characters
            return line.replace(/^#+\s*/, '').trim()
        }
    }
    return ''
}

function abbreviateString(s: string, maxLength: number) {
    if (s.length <= maxLength) return s
    else return s.slice(0, maxLength) + '...'
}

export function createTimestampCreatedText(info: BatchConfig) {
    const ts = info.timestamp_created
    if (ts === undefined) return ''
    return timeAgoString(ts)
}

// thanks https://stackoverflow.com/a/6109105/160863 and gh copilot!
function timeAgoString(timestampSeconds?: number) {
    if (timestampSeconds === undefined) return ''
    const now = Date.now()
    const diff = now - timestampSeconds * 1000
    const diffSeconds = Math.floor(diff / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffWeeks / 4)
    const diffYears = Math.floor(diffMonths / 12)
    if (diffYears > 0) {
        return `${diffYears} yr${diffYears === 1 ? '' : 's'} ago`
    }
    else if (diffWeeks > 0) {
        return `${diffWeeks} wk${diffWeeks === 1 ? '' : 's'} ago`
    }
    else if (diffDays > 0) {
        return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
    }
    else if (diffHours > 0) {
        return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`
    }
    else if (diffMinutes > 0) {
        return `${diffMinutes} min ago`
    }
    else {
        return `${diffSeconds} sec ago`
    }
}

function elapsedTimeString(numSeconds?: number) {
    if (numSeconds === undefined) return ''
    numSeconds = Math.floor(numSeconds)
    const numMinutes = Math.floor(numSeconds / 60)
    const numHours = Math.floor(numMinutes / 60)
    const numDays = Math.floor(numHours / 24)
    const numWeeks = Math.floor(numDays / 7)
    const numMonths = Math.floor(numWeeks / 4)
    const numYears = Math.floor(numMonths / 12)
    if (numYears > 0) {
        return `${numYears} yr${numYears === 1 ? '' : 's'}`
    }
    else if (numWeeks > 5) {
        return `${numWeeks} wk${numWeeks === 1 ? '' : 's'}`
    }
    else if (numDays > 5) {
        return `${numDays} day${numDays === 1 ? '' : 's'}`
    }
    else if (numHours > 5) {
        return `${numHours} hr${numHours === 1 ? '' : 's'}`
    }
    else if (numMinutes > 5) {
        return `${numMinutes} min`
    }
    else {
        return `${numSeconds} sec`
    }
}

export default BatchesTable