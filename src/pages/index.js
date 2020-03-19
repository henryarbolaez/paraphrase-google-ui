import React, { useState } from "react";
import {
  Grid,
  Box,
  Card,
  Link,
  Button,
  Container,
  TextField,
  Typography,
  CardContent,
  CssBaseline,
  ThemeProvider
} from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { makeStyles } from "@material-ui/core/styles";

import { apiRequest, API_URL, calculateManhattanDistance } from "../utils";

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
  }
});

export default function App() {
  const classes = useStyles();
  const [value, setValue] = useState({ original: "", paraphrased: "" });
  const [data, setData] = useState({ original: [], paraphrased: [] });
  const [loading, setLoading] = useState({
    original: false,
    paraphrased: false
  });

  const renderData = (hits, field) => {
    if (loading[field]) {
      return (
        <div className={classes.root}>
          <Skeleton />
          <Skeleton animation={false} />
          <Skeleton animation="wave" />
        </div>
      );
    }
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
              </Typography>
              <Link href={link}>{link}</Link>
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
    setLoading({ ...loading, [field]: true });
    const response = await apiRequest(`${API_URL}/search`, {
      params: {
        q,
        num: 40,
        engine: "google",
        google_domain: "google.com"
      }
    });

    const LIMIT = 6;
    if (response.data) {
      setData(prev => ({
        ...prev,
        [field]: response.data.organic_results.splice(0, LIMIT) || []
      }));
    } else {
      console.log("===ERROR", response.error.message);
    }
    setLoading({ ...loading, [field]: false });
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
        <Box variant="h3" component={Typography} style={{ margin: "0 auto" }}>
          Score: {calculateManhattanDistance(data)}
        </Box>
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
                  disabled={loading[field]}
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

                {renderData(data[field], field)}
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}
