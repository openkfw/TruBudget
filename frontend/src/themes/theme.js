import amber from "@mui/material/colors/amber";
import red from "@mui/material/colors/deepOrange";
import grey from "@mui/material/colors/grey";
import blue from "@mui/material/colors/indigo";
import { alpha, experimental_extendTheme as extendTheme } from "@mui/material/styles";

export const muiTheme = extendTheme({
  transitions: {
    create: () => "100ms"
  },
  palette: {
    primary: blue,
    secondary: red,
    error: red,
    warning: {
      main: amber[800]
    },
    info: blue,
    grey: {
      light: grey[100],
      main: grey[400],
      dark: grey[600]
    },
    tag: {
      main: blue[400],
      selected: blue[900]
    },
    tonalOffset: 0.6,
    empty: { state: grey[100] },
    primaryBlue: alpha("#1744e51a", 0.1),
    darkGrey: "#3f434d",
    menuBorder: alpha("#3f434d1a", 0.1)
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: "standard"
      }
    },
    MuiSelect: {
      defaultProps: {
        variant: "standard"
      }
    },
    MuiInputLabel: {
      defaultProps: {
        variant: "standard"
      }
    }
  }
});
