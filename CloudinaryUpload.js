export const uploadToCloudinary = async (imageUri) => {
    const data = new FormData();
    data.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
    });
    data.append('upload_preset', 'profile_preset'); // 🔁 BU senin Cloudinary'deki preset ismi!
    data.append('cloud_name', 'dw2jqqtic'); // 🔁 BU senin Cloudinary panelinde görünen cloud_name

    try {
        const res = await fetch('https://api.cloudinary.com/v1_1/dw2jqqtic/image/upload', {
            method: 'POST',
            body: data,
        });

        const result = await res.json();
        return result.secure_url;
    } catch (err) {
        console.error('Cloudinary Upload Error:', err);
        throw err;
    }
};
