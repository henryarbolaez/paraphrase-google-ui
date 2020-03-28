import React, { useState } from "react";
import {
  Grid,
  Box,
  Card,
  Link,
  Chip,
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

import {
  API_URL,
  findLink,
  apiRequest,
  calculateManhattanDistance
} from "../utils";

import theme from "../theme";

const useStyles = makeStyles({
  root: { marginTop: 3, position: "relative" },
  title: { fontSize: 18 }
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
    return hits.map(({ title, link, position, snippet }) => {
      const isParaphrased = field === "paraphrased";
      const topMatchers = ["chegg", "slader", "bartleby"];

      let className = "";
      let pos;
      if (data.original.length && data.paraphrased.length) {
        if (isParaphrased) {
          const anyOriginal = findLink(data.original, link, title);
          if (anyOriginal.length) {
            pos = anyOriginal[0].position;
            className = `colors-${pos}`;
          }
        } else {
          const anyParaphrased = findLink(data.paraphrased, link, title);
          if (anyParaphrased.length) {
            pos = position;
            className = `colors-${position}`;
          }
        }
      }

      const isValidMatch = topMatchers.filter(name => link.indexOf(name) >= 0)
        .length;
      return (
        <Card
          className={[
            classes.root,
            className,
            !!isValidMatch ? "bg-visiblity" : ""
          ].join(" ")}
        >
          <CardContent>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
            >
              {title}
            </Typography>
            <Link href={link}>{link}</Link>
            {pos && (
              <Chip
                size="small"
                style={{ position: "absolute", top: 0, right: 0 }}
                label={pos}
              />
            )}
          </CardContent>
        </Card>
      );
    });
  };

  const requestData = async (q, field) => {
    if (!q || !q.length) {
      return;
    }
    setLoading({ ...loading, [field]: true });
    const response = await apiRequest(`${API_URL}/search`, {
      params: {
        q: q.trim(),
        num: 40,
        engine: "google",
        google_domain: "google.com"
      }
    });

    const LIMIT = 10;
    if (response.data) {
      setData(prev => ({
        ...prev,
        [field]: response.data.organicResults.splice(0, LIMIT) || []
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
      field: "original",
      inputValue: value.original,
      buttonLabel: "Search Original"
    },
    {
      field: "paraphrased",
      inputValue: value.paraphrased,
      buttonLabel: "Search Paraphrased"
    }
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth>
        <Box variant="h3" component={Typography} style={{ margin: "0 auto" }}>
          Score: {calculateManhattanDistance(data)}
        </Box>
        <Grid container className={classes.root} spacing={6}>
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
