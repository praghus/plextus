import React from 'react'
import { useDispatch } from 'react-redux'

import { openProject } from '../../stores/editor/actions'
import { ProjectFile } from '../../stores/editor/types'

const upload = async (file: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const imageReader = new FileReader()
        imageReader.readAsText(file)
        imageReader.onload = async ev => {
            ev.target?.result ? resolve(ev.target?.result as string) : reject()
        }
    })

interface Props {
    children?: React.ReactNode
}

const ProjectUpload = ({ children }: Props) => {
    const dispatch = useDispatch()
    const onLoadProject = (project: ProjectFile) => dispatch(openProject(project))
    const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0]
        if (file) {
            const result = await upload(file)
            onLoadProject(JSON.parse(result) as ProjectFile)
        }
    }

    return (
        <>
            <input type="file" hidden id="upload-project-input" accept=".plextus" {...{ onChange }} />
            {children && <label htmlFor="upload-project-input">{children}</label>}
        </>
    )
}
ProjectUpload.displayName = 'ProjectUpload'

export default ProjectUpload
