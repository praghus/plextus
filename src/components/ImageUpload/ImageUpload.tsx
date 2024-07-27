import React from 'react'
import { useDispatch } from 'react-redux'
import { uploadImage } from '../../common/utils/image'
import { changeAppImportedImage } from '../../stores/app/actions'

interface Props {
    children?: React.ReactNode
}

const ImageUpload = ({ children }: Props) => {
    const dispatch = useDispatch()

    const upload = async (file: File) => {
        const { blob } = await uploadImage(file)
        dispatch(
            changeAppImportedImage({
                filename: file.name,
                image: window.URL.createObjectURL(blob)
            })
        )
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0]
        if (file) {
            upload(file)
            e.target.value = ''
        }
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
