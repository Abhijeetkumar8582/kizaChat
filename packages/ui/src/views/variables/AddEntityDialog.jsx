import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'

// Material
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, Typography, OutlinedInput } from '@mui/material'

// Project imports
import { StyledButton } from '@/ui-component/button/StyledButton'

// Icons
import { IconX, IconDatabase } from '@tabler/icons-react'

// API
import entitiesApi from '@/api/entities'

// utils
import useNotifier from '@/utils/useNotifier'

// const
import { HIDE_CANVAS_DIALOG, SHOW_CANVAS_DIALOG } from '@/store/actions'

const AddEntityDialog = ({ show, onCancel, onConfirm, setError }) => {
    const portalElement = document.getElementById('portal')
    const dispatch = useDispatch()

    useNotifier()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [entityName, setEntityName] = useState('')
    const [entityDescription, setEntityDescription] = useState('')

    useEffect(() => {
        if (!show) {
            setEntityName('')
            setEntityDescription('')
        }
    }, [show])

    useEffect(() => {
        if (show) dispatch({ type: SHOW_CANVAS_DIALOG })
        else dispatch({ type: HIDE_CANVAS_DIALOG })
        return () => dispatch({ type: HIDE_CANVAS_DIALOG })
    }, [show, dispatch])

    const addNewEntity = async () => {
        try {
            const obj = {
                name: entityName,
                description: entityDescription
            }
            const createResp = await entitiesApi.createEntity(obj)
            if (createResp.data) {
                enqueueSnackbar({
                    message: 'New Entity added',
                    options: {
                        key: new Date().getTime() + Math.random(),
                        variant: 'success',
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                <IconX />
                            </Button>
                        )
                    }
                })
                onConfirm(createResp.data.id)
            }
        } catch (err) {
            if (setError) setError(err)
            enqueueSnackbar({
                message: `Failed to add new Entity: ${
                    typeof err.response.data === 'object' ? err.response.data.message : err.response.data
                }`,
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error',
                    persist: true,
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
            onCancel()
        }
    }

    const component = show ? (
        <Dialog
            fullWidth
            maxWidth='sm'
            open={show}
            onClose={onCancel}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogTitle sx={{ fontSize: '1rem' }} id='alert-dialog-title'>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <IconDatabase style={{ marginRight: '10px' }} />
                    Add Entity
                </div>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ p: 2 }}>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Typography>
                            Entity Name<span style={{ color: 'red' }}>&nbsp;*</span>
                        </Typography>
                        <div style={{ flexGrow: 1 }}></div>
                    </div>
                    <OutlinedInput
                        size='small'
                        sx={{ mt: 1 }}
                        type='string'
                        fullWidth
                        placeholder='e.g., User, Product, Order'
                        onChange={(e) => setEntityName(e.target.value)}
                        value={entityName ?? ''}
                        id='txtInput_entityName'
                    />
                </Box>
                <Box sx={{ p: 2 }}>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Typography>Description</Typography>
                        <div style={{ flexGrow: 1 }}></div>
                    </div>
                    <OutlinedInput
                        size='small'
                        sx={{ mt: 1 }}
                        type='string'
                        fullWidth
                        multiline
                        rows={3}
                        placeholder='Optional description of the entity'
                        onChange={(e) => setEntityDescription(e.target.value)}
                        value={entityDescription ?? ''}
                        id='txtInput_entityDescription'
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <StyledButton
                    disabled={!entityName}
                    variant='contained'
                    onClick={() => addNewEntity()}
                    id='btn_confirmAddingNewEntity'
                >
                    Create Entity
                </StyledButton>
            </DialogActions>
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

AddEntityDialog.propTypes = {
    show: PropTypes.bool,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
    setError: PropTypes.func
}

export default AddEntityDialog

