import styled from "styled-components";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import { getRgbaValue } from "../../utils/colors";
import { TRANSPARENCY_BG_DARK_IMG } from "../../constants";

export const useStyles = makeStyles((theme) => ({
  iconButton: {
    width: 40,
    height: 40,
    padding: 0,
  },
  paper: {
    width: "48px",
    marginBottom: "10px",
  },
  divider: {
    width: "40px",
    margin: theme.spacing(1, 0.5),
  },
  icon: {
    filter: "drop-shadow(1px 1px 1px rgba(0, 0, 0, .7))",
  },
}));

export const StyledContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 10px;
  z-index: 100;
`;

export const StyledColorBox = styled.div`
  ${({ selected }) =>
    selected && `background-image: url('${TRANSPARENCY_BG_DARK_IMG}')`};
  background-size: 16px 16px;
  border-radius: 4px;
`;

export const StyledColorIndicator = styled.div`
  width: 40px;
  height: 40px;
  padding: 8px;
  border-radius: 4px;
  background-color: ${({ color, selected }) =>
    selected ? getRgbaValue(color) : "transparent"};
  ${({ selected }) =>
    selected && "box-shadow: inset 1px 1px 3px rgba(0,0,0,0.5)"};
`;

export const StyledToggleButtonGroup = withStyles((theme) => ({
  grouped: {
    margin: theme.spacing(0.5),
    border: "none",
    "&:not(:first-child)": {
      borderRadius: theme.shape.borderRadius,
    },
    "&:first-child": {
      borderRadius: theme.shape.borderRadius,
    },
  },
}))(ToggleButtonGroup);
