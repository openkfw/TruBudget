const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const ignore = require("ignore");
const each = require("async-each");
const sha256File = require("sha256-file");

function sha256Dir (dirname, options, cb) {
  if (typeof options === "function") {
    cb = options;
    options = {};
  }

  options = options || {};

  const ig = ignore();

  if (options.ignore) {
    ig.add(options.ignore);
  }
  function run (prefix, cb) {
    fs.readdir(path.join(dirname, prefix), function (err, files) {
      if (err) {
        return cb(err);
      }

      function iterator (file, cb) {
        const relativeFilepath = path.join(prefix, file);

        if (ig.ignores(relativeFilepath)) {
          return cb(null, null);
        }

        const absoluteFilepath = path.join(dirname, relativeFilepath);

        fs.stat(absoluteFilepath, function (err, stat) {
          if (err) {
            return cb(err);
          }

          if (stat.isFile()) {
            return sha256File(absoluteFilepath, cb);
          }

          if (stat.isDirectory()) {
            return run(relativeFilepath, cb);
          }

          return cb(null, null);
        });
      }

      each(files, iterator, function done (err, hashes) {
        if (err) {
          return cb(err);
        }

        const hash = crypto.createHash("sha256");

        hashes.forEach(function (h) {
          if (h !== null) {
            hash.update(h);
          }
        });

        cb(null, hash.digest("hex"));
      });
    });
  }

  return run("", cb);
}

function sha256DirAsPromised (dirname) {
  return new Promise(function (resolve, reject) {
    sha256Dir(dirname, { ignore: ["**/metadata.yml"] }, function (err, hash) {
      if (err) {
        return reject(err);
      }

      resolve(hash);
    });
  });
}

module.exports = {
  sha256Dir: sha256DirAsPromised
};
