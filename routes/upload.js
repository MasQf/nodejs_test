const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadRouter = express.Router();

// 上传文件存储配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

// 文件过滤器，只允许图片和视频类型
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.error("不支持的文件类型:", file.mimetype);
        cb(new Error("Invalid file type. Only images and videos are allowed."));
    }
};


// 配置 multer
const upload = multer({ storage, fileFilter });

// 上传文件接口
uploadRouter.post('/upload_file', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.json({ msg: "No valid file uploaded.", status: false });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(200).json({ fileUrl, msg: "File uploaded successfully.", status: true });
});

module.exports = uploadRouter;