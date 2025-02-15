import assetsModel from "../models/assetsModel.js";
import employeeModel from "../models/employeeModel.js";
import vendorModel from "../models/vendorModel.js";
import path from "path";
import moment from "moment-timezone";
import fs from "fs";

export const createAsset = async (req, res) => {
  try {
    let uploadedFile = "";

    if (req.files["assetDocument"] && req.files["assetDocument"].length > 0) {
      const taskDocumentFile = req.files["assetDocument"][0]; // Assuming maxCount is 1
      uploadedFile = "assetsDocs/" + taskDocumentFile.filename;
    }

    const {
      vendorId,
      assetName,
      vendorName,
      model,
      mobileNumber,
      lastServiceDate,
      nextServiceDate,
    } = req.body;

    //   if (!mobileNumber || !nextServiceDate ) {
    //     return res.status(400).json({ error: 'Mobile and next service date is required!' });
    //   }
    // check sendor admin or employee
    let createdBy = "";

    const vendorExisting = await vendorModel.findOne({ _id: vendorId });
    createdBy = vendorExisting ? vendorExisting.vendorName : "";

    const myDate = new Date();
    const currentDateIST = moment.utc(myDate);
    const currentDate = currentDateIST.format("YYYY-MM-DD HH:mm A");

    const newAssets = new assetsModel({
      vendorId,
      assetName,
      vendorName,
      model,
      mobileNumber,
      type: "vendor",
      lastServiceDate,
      nextServiceDate,
      createdBy,
      createdAt: currentDate,
      assetsDocument: uploadedFile,
      status: 1,
    });

    await newAssets.save();

    res.status(201).json({ message: "Asset added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Asset addition failed" });
  }
};

//For asset List api
export const assetsList = async (req, res) => {
  try {
    const { page, vendorId, perPage } = req.body;

    const currentPage = parseInt(page) || 1;
    const itemsPerPage = parseInt(perPage) || 20000; // Default to 10 items per page

    let asset = [];
    let query = {};

    query.vendorId = vendorId;

    // Count total documents matching the query
    const totalCount = await assetsModel.countDocuments(query);

    // Retrieve the paginated list
    asset = await assetsModel
      .find(query)
      .sort({ createdAt: -1 }) // Sort by creation date, descending
      .skip((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage);

    // Modify fields in the fetched documents
    asset = asset.map((item) => {
      let assetsDocument = process.env.IMAGE_BASE_URL + item.assetsDocument;

      return {
        _id: item._id,
        vendorId: item.vendorId,
        assetName: item.assetName,
        model: item.model,
        vendorName: item.vendorName,
        mobileNumber: item.mobileNumber,
        createdBy: vendorId == item.vendorId ? "You" : item.createdBy, // Add a new field for the status text
        lastServiceDate: item.lastServiceDate
          ? moment.utc(item.lastServiceDate).format("YYYY-MM-DD")
          : null,
        nextServiceDate: item.nextServiceDate
          ? moment.utc(item.nextServiceDate).format("YYYY-MM-DD")
          : null,
        // lastServiceDate: item.lastServiceDate ? new Date(item.lastServiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
        // nextServiceDate: item.nextServiceDate ? new Date(item.nextServiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
        document: item.assetsDocument != "" ? assetsDocument : "",
      };
    });

    if (!asset || asset.length === 0) {
      return res.status(404).json({
        message: "No Assets found",
        response: {
          asset: [],
          pagination: {
            totalCount: 0,
            totalPages: 0,
            currentPage: 0,
            perPage: 0,
          },
        },
      });
    }

    const response = {
      asset,
      pagination: {
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / itemsPerPage),
        currentPage: currentPage,
        perPage: itemsPerPage,
      },
    };

    res.status(200).json({ message: "Success", response });
  } catch (error) {
    console.error("Error fetching reimbursements:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

//asset Edit
export const assetsEdit = async (req, res) => {
  try {
    const { assetId } = req.params;

    // Find the task by ID
    const asset = await assetsModel.findById(assetId);

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.status(200).json(asset);
  } catch (error) {
    console.error("Error for geting Asset:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
//asset Update
export const assetsUpdate = async (req, res) => {
  try {
    let uploadedFile = "";

    if (req.files["assetDocument"] && req.files["assetDocument"].length > 0) {
      const assetDocumentFile = req.files["assetDocument"][0]; // Assuming maxCount is 1
      uploadedFile = "assetsDocs/" + assetDocumentFile.filename;
    }

    const {
      assetId,
      vendorId,
      assetName,
      vendorName,
      model,
      mobileNumber,
      lastServiceDate,
      nextServiceDate,
    } = req.body;

    // if (!assetId) {
    //     return res.status(400).json({ error: 'Asset ID is required' });
    // }

    // if (!mobileNumber || !nextServiceDate) {
    //     return res.status(400).json({ error: 'Mobile number and next service date are required' });
    // }

    // Check sender admin or employee
    let createdBy = "";

    const vendorExisting = await vendorModel.findOne({ _id: vendorId });
    createdBy = vendorExisting ? vendorExisting.vendorName : "";

    const myDate = new Date();
    const currentDateIST = moment.utc(myDate);
    const currentDate = currentDateIST.format("YYYY-MM-DD HH:mm A");

    // Retrieve the existing asset record
    const existingAsset = await assetsModel.findById(assetId);

    if (!existingAsset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    // Determine the file name to use
    const existingFileName = existingAsset.assetsDocument;
    const newFileName = uploadedFile ? uploadedFile : existingFileName;

    // Define the directory for file uploads
    const uploadDir = path.join(__dirname, "..", "public", "assetsDocs");

    // If a new file is uploaded, delete the old file
    if (uploadedFile && existingFileName && existingFileName !== uploadedFile) {
      const oldFilePath = path.join(uploadDir, path.basename(existingFileName));

      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting old file:", err);
        }
      });
    }

    // Update existing asset
    const updatedAsset = await assetsModel.findByIdAndUpdate(
      assetId,
      {
        vendorId,
        assetName,
        vendorName,
        model,
        mobileNumber,
        lastServiceDate,
        nextServiceDate,
        createdBy,
        updatedAt: currentDate, // Track the last update time
        assetsDocument: newFileName, // Update with new file name or keep existing one
      },
      { new: true } // Return the updated document
    );

    res
      .status(200)
      .json({ message: "Asset updated successfully", data: updatedAsset });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Asset update failed", error: error.message });
  }
};

// asset Delete
export const assetsDelete = async (req, res) => {
  try {
    const { assetId } = req.params;

    // Check if the reimbursement exists
    const existingAsset = await assetsModel.findById(assetId);

    if (!existingAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // Define the directory for file uploads
    const uploadDir = path.join(__dirname, "..", "public", "assetsDocs");

    // Delete the associated file if it exists
    const existingFileName = existingAsset.assetsDocument;
    if (existingFileName) {
      const filePath = path.join(uploadDir, path.basename(existingFileName));

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      });
    }

    // Perform the deletion of the reimbursement record
    await assetsModel.findByIdAndDelete(assetId);

    // Send a success response
    res.status(200).json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Error for Asset Delete:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
