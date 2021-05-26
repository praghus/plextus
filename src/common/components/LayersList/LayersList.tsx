import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { makeStyles } from "@material-ui/core/styles";
import styled from "@emotion/styled";
import AddIcon from "@material-ui/icons/Add";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import IconButton from "@material-ui/core/IconButton";
import AppsIcon from "@material-ui/icons/Apps";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";

import ConfirmationDialog from "../ConfirmationDialog";
import { changeItemPosition } from "../../utils/array";
import { getLayerById } from "../../../store/editor/utils";
import { Layer } from "../../../store/editor/types";
import {
  changeSelectedLayer,
  changeLayers,
  changeLayerOpacity,
  changeLayerVisible,
} from "../../../store/editor/actions";
import {
  selectCanvas,
  selectSelected,
  selectLayers,
  selectTileset,
} from "../../../store/editor/selectors";

const useStyles = makeStyles((theme) => ({
  layersList: {
    width: "100%",
    position: "relative",
    overflow: "auto",
    maxWidth: 360,
    minHeight: 190,
    backgroundColor: theme.palette.background.paper,
  },
}));

export const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 5px;
`;

const LayersList = (): JSX.Element => {
  const classes = useStyles();
  const canvas = useSelector(selectCanvas);
  const layers = useSelector(selectLayers);
  const selected = useSelector(selectSelected);
  const tileset = useSelector(selectTileset);
  const reversedList = [...layers].reverse();
  const currentLayer = getLayerById(layers, selected.layerId) || layers[0];

  const [opacity, setOpacity] = React.useState(
    currentLayer ? currentLayer.opacity : 255,
  );
  const [confirmationDialogOpen, setConfirmationDialogOpen] =
    React.useState(false);

  const dispatch = useDispatch();
  const onChangeLayers = (layers: Layer[]) => dispatch(changeLayers(layers));
  const onChangeSelectedLayer = (layerId: string) =>
    dispatch(changeSelectedLayer(layerId));
  const onChangeLayerVisible = (layerId: string, value: boolean) =>
    dispatch(changeLayerVisible(layerId, value));
  const onChangeLayerOpacity = (layerId: string, value: number) =>
    dispatch(changeLayerOpacity(layerId, value));
  const onOpenConfirmationDialog = () => setConfirmationDialogOpen(true);
  const onCancelRemoveLayer = () => setConfirmationDialogOpen(false);
  const onOpacityChange = (event: any, value: any) => setOpacity(value);
  const onOpacityChangeCommitted = (event: any, value: any) =>
    onChangeLayerOpacity(currentLayer.id, value);

  const onConfirmRemoveLayer = () => {
    const index = layers.indexOf(currentLayer);
    const newLayers = [...layers];
    newLayers.splice(index, 1);

    onChangeLayers(newLayers);
    setConfirmationDialogOpen(false);
    if (newLayers.length) {
      onChangeSelectedLayer(newLayers[newLayers.length - 1].id);
    }
  };

  const onChangeLayerOrder = (dir: number) => {
    const index = layers.indexOf(currentLayer);
    const from = dir > 0 ? index - 1 : index;
    const to = dir > 0 ? index : index + 1;

    onChangeLayers(changeItemPosition([...layers], from, to));
  };

  const onCreateNewLayer = () => {
    const newLayer = {
      id: uuidv4(),
      opacity: 255,
      visible: true,
      name: "New Layer",
      width: Math.round(canvas.width / tileset.tilewidth),
      height: Math.round(canvas.height / tileset.tileheight),
      data: [],
    };
    onChangeLayers([...layers, newLayer]);
  };

  return (
    <>
      <Typography gutterBottom>Layers</Typography>
      <Grid container>
        <Grid item xs={3}>
          Opacity
        </Grid>
        <Grid item xs={9}>
          <Slider
            min={0}
            max={255}
            value={opacity}
            onChange={onOpacityChange}
            onChangeCommitted={onOpacityChangeCommitted}
          />
        </Grid>
      </Grid>
      <ConfirmationDialog
        title="Hold on!"
        message="Are you sure you want to remove this layer?"
        open={confirmationDialogOpen}
        onConfirm={onConfirmRemoveLayer}
        onCancel={onCancelRemoveLayer}
      />
      <List className={classes.layersList}>
        {reversedList.map(({ id, name, visible }) => (
          <ListItem
            key={id}
            dense
            button
            selected={id === selected.layerId}
            onClick={() => {
              setOpacity(getLayerById(layers, id).opacity);
              onChangeSelectedLayer(id);
            }}
          >
            <ListItemIcon>
              <AppsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText id={`checkbox-list-label-${id}`} primary={name} />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="comments"
                onClick={() => {
                  onChangeLayerVisible(id, !visible);
                }}
              >
                {visible ? (
                  <VisibilityIcon fontSize="small" />
                ) : (
                  <VisibilityOffIcon fontSize="small" />
                )}
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <StyledButtonContainer>
        <IconButton size="small" onClick={onCreateNewLayer}>
          <AddIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          disabled={layers.indexOf(currentLayer) === 0}
          onClick={() => onChangeLayerOrder(1)}
        >
          <ArrowDownwardIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          disabled={layers.indexOf(currentLayer) === layers.length - 1}
          onClick={() => onChangeLayerOrder(-1)}
        >
          <ArrowUpwardIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={onOpenConfirmationDialog}>
          <DeleteForeverIcon fontSize="small" />
        </IconButton>
      </StyledButtonContainer>
    </>
  );
};

export default LayersList;
