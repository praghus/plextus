import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    InputAdornment,
    Stack,
    TextField,
    Typography
} from '@mui/material'
import { useNewProjectDialogToggle } from '../../hooks/useDialogToggle'
import { createNewProject } from '../../store/editor/actions'
import { selectTileset } from '../../store/editor/selectors'
import { ProjectConfig } from '../../store/editor/types'

const NewProjectDialog = () => {
    const tileset = useSelector(selectTileset)

    const { t } = useTranslation()

    const [isOpen, setIsOpen] = useNewProjectDialogToggle()
    const [config, setConfig] = useState<ProjectConfig>({
        columns: tileset.columns,
        h: 160 / tileset.tileheight,
        name: 'New project',
        tileheight: tileset.tileheight,
        tilewidth: tileset.tilewidth,
        w: 160 / tileset.tilewidth
    })

    const dispatch = useDispatch()

    const onClose = () => setIsOpen(false)
    const handleClose = (e: React.SyntheticEvent<Element, Event>, reason: string): void => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            onClose()
        }
    }
    const onSave = () => {
        dispatch(createNewProject(config))
        onClose()
    }

    return (
        <Dialog open={isOpen} onClose={handleClose} aria-labelledby="form-dialog-title">
            <DialogContent sx={{ maxWidth: '500px' }}>
                <TextField
                    sx={{ marginBottom: '20px' }}
                    fullWidth={true}
                    value={config.name}
                    onChange={e => setConfig({ ...config, name: e.target.value })}
                    id="name"
                    label={t('i18_project_name')}
                    size="small"
                    variant="standard"
                />
                <Typography variant="subtitle1" gutterBottom>
                    {t('i18_map')}
                </Typography>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                    sx={{ marginBottom: 1 }}
                >
                    <TextField
                        type="number"
                        value={config.w}
                        onChange={e => {
                            const w = parseInt(e.target.value)
                            Number.isInteger(w) && w > 0 && setConfig({ ...config, w })
                        }}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">tiles</InputAdornment>,
                            inputProps: { min: 1 }
                        }}
                        id="width"
                        label="Map width"
                        size="small"
                        variant="outlined"
                    />
                    <TextField
                        type="number"
                        value={config.h}
                        onChange={e => {
                            const h = parseInt(e.target.value)
                            Number.isInteger(h) && h > 0 && setConfig({ ...config, h })
                        }}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">tiles</InputAdornment>,
                            inputProps: { min: 1 }
                        }}
                        id="height"
                        label="Map height"
                        size="small"
                        variant="outlined"
                    />
                </Stack>

                <Typography variant="subtitle1" gutterBottom>
                    {t('i18_tileset')}
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <TextField
                        type="number"
                        value={config.tilewidth}
                        InputProps={{ inputProps: { min: 1 } }}
                        onChange={e => {
                            const tilewidth = parseInt(e.target.value)
                            Number.isInteger(tilewidth) && tilewidth > 0 && setConfig({ ...config, tilewidth })
                        }}
                        id="tileWidth"
                        label="Tile width (px)"
                        size="small"
                        variant="outlined"
                    />
                    <TextField
                        type="number"
                        value={config.tileheight}
                        InputProps={{ inputProps: { min: 1 } }}
                        onChange={e => {
                            const tileheight = parseInt(e.target.value)
                            Number.isInteger(tileheight) && tileheight > 0 && setConfig({ ...config, tileheight })
                        }}
                        id="tileHeight"
                        label="Tile height (px)"
                        size="small"
                        variant="outlined"
                    />
                    <TextField
                        type="number"
                        value={config.columns}
                        onChange={e => {
                            const columns = parseInt(e.target.value)
                            Number.isInteger(columns) && columns > 0 && setConfig({ ...config, columns })
                        }}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">columns</InputAdornment>,
                            inputProps: { min: 1 }
                        }}
                        id="cols"
                        label="Tileset maximum width"
                        size="small"
                        variant="outlined"
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Typography variant="caption" display="block" sx={{ color: '#ccc', padding: '5px 20px' }}>
                    {config.w * config.tilewidth} x {config.h * config.tileheight} pixels
                </Typography>
                <div style={{ flex: '1 0 0' }} />
                <Button onClick={onClose} color="primary">
                    {t('i18_cancel')}
                </Button>
                <Button onClick={onSave} variant="contained">
                    {t('i18_create')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default NewProjectDialog
