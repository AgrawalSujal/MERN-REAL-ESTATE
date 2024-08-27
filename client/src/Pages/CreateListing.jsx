import { useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [""],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });

  const [imageUploadError, setImageUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if user is not logged in
  if (!currentUser) {
    return <p>You must be logged in to create a listing.</p>;
  }
  //double check for authentication
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User is signed in:", user);
    } else {
      console.log("No user is signed in.");
    }
  });

  const handleImageSubmit = () => {
    if (files.length > 0 && formData.imageUrls.length + files.length <= 7) {
      setUploading(true);
      setImageUploadError("");

      const promises = [];

      for (let i = 0; i < files.length; i++) {
        // console.log(storeImage(files[i]));
        // validateFile(files[i]);
        promises.push(storeImage(files[i]));
      }

      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setUploading(true);
        })
        .catch((err) => {
          setImageUploadError("Image upload failed (10MB max per image)");
          setUploading(false);
          console.error(err); // for debugging
        });
    } else {
      setImageUploadError("You can only upload 6 images per listing");
    }
  };

  // Function to handle image upload to Firebase Storage

  const storeImage = async (file) => {
    try {
      const storage = getStorage(app);
      const uniqueFileName = `${new Date().getTime()}_${Math.random()
        .toString(36)
        .substr(2, 9)}_${file.name}`;
      const storageRef = ref(storage, uniqueFileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Promise to handle upload progress and completion
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            <p>`Upload is ${progress.toFixed(2)}% done`</p>;
            console.log(`Upload is ${progress.toFixed(2)}% done`);
          },
          (error) => {
            let errorMessage;
            switch (error.code) {
              case "storage/unauthorized":
                errorMessage =
                  "User doesn't have permission to access the object.";
                break;
              case "storage/canceled":
                errorMessage = "User canceled the upload.";
                break;
              case "storage/unknown":
                errorMessage =
                  "Unknown error occurred. Inspect error.serverResponse.";
                break;
              default:
                errorMessage = `Upload failed: ${error.message}`;
            }
            reject(errorMessage);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref)
              .then((downloadURL) => {
                console.log(downloadURL);
                resolve(downloadURL);
              })
              .catch((err) => {
                reject(`Failed to get download URL: ${err.message}`);
              });
          }
        );
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred during the upload.");
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    const { id, value, checked, type } = e.target;

    if (id === "sale" || id === "rent") {
      setFormData((prevData) => ({
        ...prevData,
        type: id,
      }));
    } else if (id === "parking" || id === "furnished" || id === "offer") {
      setFormData((prevData) => ({
        ...prevData,
        [id]: checked,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [id]: type === "number" ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.imageUrls.length < 1) {
      return setError("You must upload at least one image");
    }

    if (+formData.regularPrice < +formData.discountPrice) {
      return setError("Discount price must be lower than regular price");
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/listing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!data.success) {
        setError(data.message);
      } else {
        navigate(`/listing/${data._id}`);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "sale"}
              />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "rent"}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleChange}
                checked={formData.parking}
              />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                onChange={handleChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <span>Beds</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <span>Baths</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="50"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                <span className="text-xs">($ / month)</span>
              </div>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min="1"
                  required
                  className="p-3 border border-gray-300 rounded-lg"
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
                <div className="flex flex-col items-center">
                  <p>Discounted price</p>
                  <span className="text-xs">($ / month)</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <label
            htmlFor="formImage"
            className="block text-lg mb-3 font-semibold"
          >
            Images
          </label>
          <div className="mb-5 w-full min-h-[300px] border-dashed border-2 p-3 rounded-md">
            <div className="mb-4">
              <input
                type="file"
                id="formImage"
                accept=".jpg,.png,.jpeg,.gif"
                multiple
                onChange={(e) => setFiles([...e.target.files])}
                disabled={uploading || formData.imageUrls.length >= 6}
                className="file-input file-input-bordered file-input-md w-full"
              />

              {uploading && (
                  <p className="text-blue-600 mt-2">
                    Uploading images please wait...
                  </p>
                ) &&
                !imageUploadError &&
                uploading && (
                  <p className="text-green-500">Image Uploaded successfully</p>
                )}
              {imageUploadError && (
                <p className="text-red-600 mt-2">{imageUploadError}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              {formData.imageUrls.map((url, index) => (
                <div key={index} className="relative w-24 h-24">
                  <img
                    src={url}
                    alt={`Upload images (JPG/JPEG/PNG) `}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1"
                    onClick={() => handleRemoveImage(index)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleImageSubmit}
            className="btn btn-primary w-full mb-4  hover:text-slate-900 shadow-black disabled:opacity-45 text-orange-700"
          >
            Upload Images
          </button>
          <button
            type="submit"
            className={`btn btn-success w-full ${
              loading && "loading"
            } hover:text-slate-900 shadow-black disabled:opacity-45 text-orange-700`}
            disabled={loading}
          >
            {loading ? (
              "Submitting..." ? (
                <p className="text-green-500">Listing Created Successfully</p>
              ) : (
                <p className="text-red-700">Error</p>
              )
            ) : (
              "Submit Listing"
            )}
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      </form>
    </main>
  );
}
