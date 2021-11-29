import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

type Props = {
    message: string
    onConfirm: (e: React.MouseEvent<HTMLElement>) => void
    onClose: (e: React.MouseEvent<HTMLElement>) => void
    open: boolean
    title: string
}

const ConfirmationDialog = ({ message, onConfirm, onClose, open, title }: Props): JSX.Element => {
    const { t } = useTranslation()
    return (
        <Dialog {...{ onClose, open }}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    {t('cancel')}
                </Button>
                <Button onClick={onConfirm} variant="contained" autoFocus>
                    {t('yes')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
ConfirmationDialog.displayName = 'ConfirmationDialog'

export default ConfirmationDialog
