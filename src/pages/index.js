import React, { useState } from "react";
import {
  Box,
  Grid,
  AppBar,
  Button,
  Toolbar,
  TextField,
  Typography,
  CssBaseline,
  ThemeProvider,
  Card,
  CardContent,
  Container
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { apiRequest, API_URL } from "../utils";

import theme from "../theme";

const useStyles = makeStyles({
  root: {
    marginTop: 3
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  title: {
    fontSize: 18
  },
  pos: {
    marginBottom: 12
  }
});

export default function App() {
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;
  const [value, setValue] = useState({ original: "", paraphrased: "" });
  const [data, setData] = useState({ original: [], paraphrased: [] });

  const renderData = hits => {
    return hits.map(
      ({ title, link, position, related_pages_link, snippet }) => {
        return (
          <Card className={classes.root}>
            <CardContent>
              <Typography
                className={classes.title}
                color="textSecondary"
                gutterBottom
              >
                {title}
                {bull}
                {position}
              </Typography>
              <Typography variant="body3" component="p">
                {snippet}
              </Typography>
            </CardContent>
          </Card>
        );
      }
    );
  };

  const requestData = async (q, field) => {
    if (!q || !q.length) {
      return;
    }
    const response = await apiRequest(`${API_URL}/search`, {
      params: {
        engine: "google",
        q,
        google_domain: "google.com"
      }
    });

    setData(prev => ({
      ...prev,
      [field]: response.data.organic_results || []
    }));
  };

  const handleChange = ({ target }) => {
    setValue({ ...value, [target.name]: target.value });
  };

  const dataToRender = [
    {
      buttonLabel: "Search Original",
      field: "original",
      inputValue: value.original
    },
    {
      buttonLabel: "Search Paraphrased",
      field: "paraphrased",
      inputValue: value.paraphrased
    }
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth>
        <Grid container className={classes.root} spacing={2}>
          {dataToRender.map(({ inputValue, field, buttonLabel }) => {
            return (
              <Grid item sm={6}>
                <Button
                  style={{ margin: "10px 0" }}
                  color="primary"
                  variant="contained"
                  onClick={async () => {
                    requestData(inputValue, field);
                  }}
                >
                  {buttonLabel}
                </Button>
                <TextField
                  fullWidth
                  label={`${field} question`}
                  name={field}
                  multiline
                  rows="4"
                  variant="outlined"
                  value={inputValue}
                  onChange={handleChange}
                  style={{ marginBottom: 10 }}
                />

                {renderData(data.original)}
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}
