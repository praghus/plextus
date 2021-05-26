import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import Menu from "@material-ui/core/Menu";
import MenuIcon from "@material-ui/icons/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import ToggleButton from "@material-ui/lab/ToggleButton";
import SelectAllIcon from "@material-ui/icons/SelectAll";
import CreateIcon from "@material-ui/icons/Create";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import GridOnIcon from "@material-ui/icons/GridOn";
import GridOffIcon from "@material-ui/icons/GridOff";
import PanToolIcon from "@material-ui/icons/PanTool";
import Divider from "@material-ui/core/Divider";
import Paper from "@material-ui/core/Paper";

import EraserIcon from "../Icons/EraserIcon";
import StampIcon from "../Icons/StampIcon";
import { TOOLS } from "../../constants";
import { selectGrid, selectSelected } from "../../../store/editor/selectors";
import {
  changeTool,
  saveChanges,
  toggleShowGrid,
} from "../../../store/editor/actions";
import {
  useStyles,
  StyledColorBox,
  StyledContainer,
  StyledToggleButtonGroup,
  StyledColorIndicator,
} from "./ToolBar.styled";

const ToolBar = ({ onImportDialogOpen }) => {
  const classes = useStyles();
  const grid = useSelector(selectGrid);
  const selected = useSelector(selectSelected);

  const [anchorEl, setAnchorEl] = useState(null);

  const dispatch = useDispatch();
  const handleClose = () => setAnchorEl(null);
  const onChangeTool = (tool) => tool && dispatch(changeTool(tool));
  const onSaveChanges = () => dispatch(saveChanges());
  const onToggleShowGrid = (showGrid) => dispatch(toggleShowGrid(showGrid));
  const handleClick = (event) => setAnchorEl(event.currentTarget);

  return (
    <StyledContainer>
      <Paper elevation={5} className={classes.paper}>
        <StyledToggleButtonGroup
          exclusive
          value={selected.tool}
          size="small"
          orientation="vertical"
          onChange={(event, value) => onChangeTool(value)}
        >
          <IconButton
            aria-haspopup="true"
            onClick={handleClick}
            className={classes.iconButton}
          >
            <MenuIcon className={classes.icon} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>New project</MenuItem>
            <MenuItem onClick={handleClose}>Undo</MenuItem>
            <MenuItem onClick={handleClose}>Redo</MenuItem>
            <Divider orientation="horizontal" />
            <MenuItem
              onClick={() => {
                handleClose();
                onImportDialogOpen();
              }}
            >
              Import image
            </MenuItem>
            <MenuItem onClick={handleClose} component={Link} to={"/export"}>
              Export map
            </MenuItem>
            <Divider orientation="horizontal" />
            <MenuItem
              onClick={() => {
                onSaveChanges();
                handleClose();
              }}
            >
              Save
            </MenuItem>
          </Menu>

          <Divider orientation="horizontal" className={classes.divider} />

          <ToggleButton value={TOOLS.PENCIL} style={{ padding: 0 }}>
            <StyledColorBox selected={selected.tool === TOOLS.PENCIL}>
              <StyledColorIndicator
                color={selected.color}
                selected={selected.tool === TOOLS.PENCIL}
              >
                <CreateIcon className={classes.icon} />
              </StyledColorIndicator>
            </StyledColorBox>
          </ToggleButton>
          <ToggleButton value={TOOLS.ERASER}>
            <EraserIcon className={classes.icon} />
          </ToggleButton>
          {/* <ToggleButton value={TOOLS.COLOR_PICKER}>
            <ColorizeIcon />
          </ToggleButton> */}
          <ToggleButton value={TOOLS.STAMP}>
            <StampIcon className={classes.icon} />
          </ToggleButton>
          <ToggleButton value={TOOLS.DELETE}>
            <DeleteForeverIcon className={classes.icon} />
          </ToggleButton>
          <ToggleButton value={TOOLS.SELECT}>
            <SelectAllIcon className={classes.icon} />
          </ToggleButton>
          <ToggleButton value={TOOLS.DRAG}>
            <PanToolIcon className={classes.icon} />
          </ToggleButton>

          <Divider orientation="horizontal" className={classes.divider} />

          <IconButton
            onClick={() => onToggleShowGrid(!grid.visible)}
            className={classes.iconButton}
          >
            {grid.visible ? (
              <GridOnIcon className={classes.icon} />
            ) : (
              <GridOffIcon className={classes.icon} />
            )}
          </IconButton>
        </StyledToggleButtonGroup>
      </Paper>
    </StyledContainer>
  );
};

ToolBar.propTypes = {
  onImportDialogOpen: PropTypes.func.isRequired,
};

export default ToolBar;
