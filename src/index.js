import cors from "cors";
import express from "express";
import analyzeImage from "./utils.js";
import { Buffer } from "buffer";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello, Math Draw app backend welcomes you!");
});

app.post("/evaluate", async (req, res) => {
  try {
    const { image, dict_of_vars } = req.body;
    const base64Data = await image.split(",")[1];
    const imageBuffer = await Buffer.from(base64Data, "base64");

    const responses = await analyzeImage(imageBuffer, dict_of_vars);

    const data = responses.map((response) => response);

    return res.json({
      message: "Image processed",
      data: data,
      status: "success",
    });
  } catch (error) {
    console.error("Error processing image: ", error);
    res.status(500).json({
      message: "Failed to process image",
      error: error.message,
      status: "error",
    });
  }
});

app
  .listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  })
  .on("error", (error) => {
    console.error(error);
  });
