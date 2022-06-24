import React from 'react'
import { useDispatch } from 'react-redux'
import { uploadImage } from '../../common/utils/image'
import { changeAppImportedImage } from '../../store/app/actions'

interface Props {
    children?: React.ReactNode
}

const ImageUpload: React.FunctionComponent<Props> = ({ children }) => {
    const dispatch = useDispatch()
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        async function upload(file: File) {
            const { blob } = await uploadImage(file)
            dispatch(changeAppImportedImage({ filename: file.name, image: window.URL.createObjectURL(blob) }))
        }
        const file = e.target.files && e.target.files[0]
        if (file) upload(file)
    }

    return (
        <>
            <input type="file" hidden id="upload-input" accept="image/png, image/gif, image/jpeg" {...{ onChange }} />
            {children && <label htmlFor="upload-input">{children}</label>}
        </>
    )
}
ImageUpload.displayName = 'ImageUpload'

export default ImageUpload
