const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Définir le stockage avec multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.toLowerCase().split(' ').join('_') + Date.now() + ".jpg";
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage });

// Middleware pour optimiser les images
const optimize = async (req, res, next) => {
  if (!req.file) return next();

  const inputPath = req.file.path;
  const outputFilename = 'opt_' + req.file.filename.replace(/\.[^.]+$/, ".webp"); // remplace extension
  const outputPath = path.join('uploads', outputFilename);

  try {
    await sharp(inputPath)
      .resize({ height: 600, fit: 'inside' }) // ajustable selon ton besoin
      .webp({ quality: 80 }) // compression + format webp
      .toFile(outputPath);

    // Supprimer le fichier original
    fs.unlinkSync(inputPath);

    // Mettre à jour req.file avec le nouveau chemin
    req.file.filename = outputFilename;
    req.file.path = outputPath;

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { upload, optimize };
