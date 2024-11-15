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
    darkBlue: "#1744E5",
    deepDarkBlue: "#111826",
    darkGrey: "#3f434d",
    faintGrey: alpha("#3f434d", 0.1),
    primaryBlue: alpha("#1744e51a", 0.1),
    openStatus: alpha("#1744E599", 0.6),
    closeStatus: "#39F439",
    menuBorder: alpha("#3f434d1a", 0.1),
    tag: {
      text: "#111826",
      main: alpha("#111826", 0.05),
      selected: "#111826"
    },
    tonalOffset: 0.6,
    empty: { state: grey[100] }
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
