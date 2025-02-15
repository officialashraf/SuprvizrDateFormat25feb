import licenseModel from "../models/licenseModel.js";
import vendorModel from "../models/vendorModel.js";
import path from "path";
import moment from "moment-timezone";
import fs from "fs";

export const createLicense = async (req, res) => {
  try {
    let licenseDocument = "";
    let licenseImage = "";

    if (
      req.files["licenseDocument"] &&
      req.files["licenseDocument"].length > 0
    ) {
      const taskDocumentFile = req.files["licenseDocument"][0]; // Assuming maxCount is 1
      licenseDocument = "licenseDocs/" + taskDocumentFile.filename;
    }

    if (req.files["licenseImage"] && req.files["licenseImage"].length > 0) {
      const taskDocumentFile = req.files["licenseImage"][0]; // Assuming maxCount is 1
      licenseImage = "licenseDocs/" + taskDocumentFile.filename;
    }

    const {
      vendorId,
      licenseName,
      licenseNumber,
      contactPerson,
      licenseIssueDate,
      mobileNumber,
      licenseExpireDate,
    } = req.body;

    //   if (!mobileNumber || !licenseExpireDate ) {
    //       return res.status(400).json({ error: 'Mobile and license expire date is required!' });
    //   }

    // check sendor admin or employee
    let createdBy = "";

    const vendorExisting = await vendorModel.findOne({ _id: vendorId });
    createdBy = vendorExisting.vendorName;

    const myDate = new Date();
    const currentDateIST = moment.utc(myDate);
    const currentDate = currentDateIST.format("YYYY-MM-DD HH:mm A");

    const newLicenses = new licenseModel({
      vendorId,
      licenseName,
      licenseNumber,
      contactPerson,
      mobileNumber,
      type: "vendor",
      licenseIssueDate,
      licenseExpireDate,
      createdBy,
      createdAt: currentDate,
      licenseDocument: licenseDocument,
      licenseImage: licenseImage,
      status: 1,
    });

    await newLicenses.save();

    res.status(201).json({ message: "License added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "License addition failed" });
  }
};

//For license List api
export const licenseList = async (req, res) => {
  try {
    const { page, vendorId, perPage } = req.body;

    const currentPage = parseInt(page) || 1;
    const itemsPerPage = parseInt(perPage) || 20000; // Default to 10 items per page

    let license = [];
    let query = {};

    query.vendorId = vendorId;

    // Count total documents matching the query
    const totalCount = await licenseModel.countDocuments(query);

    // Retrieve the paginated list
    license = await licenseModel
      .find(query)
      .sort({ createdAt: -1 }) // Sort by creation date, descending
      .skip((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage);

    // Modify fields in the fetched documents
    license = license.map((item) => {
      let licenseDocument = process.env.IMAGE_BASE_URL + item.licenseDocument;
      let licenseImage = process.env.IMAGE_BASE_URL + item.licenseImage;

      return {
        _id: item._id,
        vendorId: item.vendorId,
        licenseName: item.licenseName,
        licenseNumber: item.licenseNumber,
        contactPerson: item.contactPerson,
        mobileNumber: item.mobileNumber,
        createdBy: vendorId == item.vendorId ? "You" : item.createdBy, // Add a new field for the status text
        licenseIssueDate: item.licenseIssueDate
          ? moment.utc(item.licenseIssueDate).format("YYYY-MM-DD")
          : null,

        licenseExpireDate: item.licenseExpireDate
          ? moment.utc(item.licenseExpireDate).format("YYYY-MM-DD")
          : null,
        // licenseIssueDate: item.licenseIssueDate ? new Date(item.licenseIssueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
        // licenseExpireDate: item.licenseExpireDate ? new Date(item.licenseExpireDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
        document: item.licenseDocument != "" ? licenseDocument : "",
        image: item.licenseImage != "" ? licenseImage : "",
      };
    });

    if (!license || license.length === 0) {
      return res.status(404).json({
        message: "No Assets found",
        response: {
          license: [],
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
      license,
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

//license Edit
export const licenseEdit = async (req, res) => {
  try {
    const { licenseId } = req.params;

    // Find the task by ID
    const license = await licenseModel.findById(licenseId);

    if (!license) {
      return res.status(404).json({ message: "License not found" });
    }

    res.status(200).json(license);
  } catch (error) {
    console.error("Error for geting License:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
//license Update
export const licenseUpdate = async (req, res) => {
  try {
    let licenseDocument = "";
    let licenseImage = "";

    const {
      licenseId,
      vendorId,
      licenseName,
      licenseNumber,
      contactPerson,
      licenseIssueDate,
      mobileNumber,
      licenseExpireDate,
    } = req.body;

    if (!licenseId) {
      return res.status(400).json({ error: "License ID is required" });
    }

    if (!mobileNumber || !licenseExpireDate) {
      return res
        .status(400)
        .json({ error: "Mobile and license expire date are required!" });
    }

    // Retrieve the existing license record
    const existingLicense = await licenseModel.findById(licenseId);
    if (!existingLicense) {
      return res.status(404).json({ error: "License not found" });
    }

    const existingLicenseDocument = existingLicense.licenseDocument;
    const existingLicenseImage = existingLicense.licenseImage;

    // Define the directory for file uploads
    const uploadDir = path.join(__dirname, "..", "public", "licenseDocs");

    // Handle license document upload
    if (
      req.files["licenseDocument"] &&
      req.files["licenseDocument"].length > 0
    ) {
      const taskDocumentFile = req.files["licenseDocument"][0];
      licenseDocument = "licenseDocs/" + taskDocumentFile.filename;

      // Delete the old license document if a new one is uploaded
      if (
        existingLicenseDocument &&
        existingLicenseDocument !== licenseDocument
      ) {
        const oldFilePath = path.join(
          uploadDir,
          path.basename(existingLicenseDocument)
        );
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error("Error deleting old license document:", err);
          }
        });
      }
    } else {
      licenseDocument = existingLicenseDocument;
    }

    // Handle license image upload
    if (req.files["licenseImage"] && req.files["licenseImage"].length > 0) {
      const taskDocumentFile = req.files["licenseImage"][0];
      licenseImage = "licenseDocs/" + taskDocumentFile.filename;

      // Delete the old license image if a new one is uploaded
      if (existingLicenseImage && existingLicenseImage !== licenseImage) {
        const oldFilePath = path.join(
          uploadDir,
          path.basename(existingLicenseImage)
        );
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error("Error deleting old license image:", err);
          }
        });
      }
    } else {
      licenseImage = existingLicenseImage;
    }

    // Check if vendor exists
    const vendorExisting = await vendorModel.findOne({ _id: vendorId });
    let createdBy = vendorExisting ? vendorExisting.vendorName : "";

    const myDate = new Date();
    const currentDateIST = moment.utc(myDate);
    const currentDate = currentDateIST.format("YYYY-MM-DD HH:mm A");

    // Update the license record
    const updatedLicense = await licenseModel.findByIdAndUpdate(
      licenseId,
      {
        vendorId,
        licenseName,
        licenseNumber,
        contactPerson,
        mobileNumber,
        licenseIssueDate,
        licenseExpireDate,
        createdBy,
        updatedAt: currentDate,
        licenseDocument: licenseDocument,
        licenseImage: licenseImage,
        status: 1,
      },
      { new: true } // Return the updated document
    );

    res
      .status(200)
      .json({ message: "License updated successfully", data: updatedLicense });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "License update failed", error: error.message });
  }
};

// license Delete
export const licenseDelete = async (req, res) => {
  try {
    const { licenseId } = req.params;

    // Check if the reimbursement exists
    const existingLicense = await licenseModel.findById(licenseId);

    if (!existingLicense) {
      return res.status(404).json({ message: "License not found" });
    }

    // Define the directory for file uploads
    const uploadDir = path.join(__dirname, "..", "public", "licensesDocs");

    // Delete the associated file if it exists
    const existingFileName = existingLicense.licensesDocument;
    if (existingFileName) {
      const filePath = path.join(uploadDir, path.basename(existingFileName));

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      });
    }

    // Perform the deletion of the reimbursement record
    await licenseModel.findByIdAndDelete(licenseId);

    // Send a success response
    res.status(200).json({ message: "License deleted successfully" });
  } catch (error) {
    console.error("Error for License Delete:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
