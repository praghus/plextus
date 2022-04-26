import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import { useTranslation } from 'react-i18next'

interface Props {
    message: string
    onConfirm: (e: React.MouseEvent<HTMLElement>) => void
    onClose: (e: React.MouseEvent<HTMLElement>) => void
    open: boolean
    title: string
}

const ConfirmationDialog: React.FunctionComponent<Props> = ({ message, onConfirm, onClose, open, title }) => {
    const { t } = useTranslation()
    return (
        <Dialog {...{ onClose, open }}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    {t('i18_cancel')}
                </Button>
                <Button onClick={onConfirm} variant="contained" autoFocus>
                    {t('i18_yes')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
ConfirmationDialog.displayName = 'ConfirmationDialog'

export default ConfirmationDialog
