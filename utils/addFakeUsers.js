import { collection, addDoc } from 'firebase/firestore';
import { db } from '../fireBase';

const descriptions = [
    'Experienced software developer.',
    'Creative graphic designer.',
    'Cybersecurity enthusiast.',
    'Aspiring data scientist.',
    'Professional violinist.',
    'Machine learning lover.',
    'Full-stack engineer.',
    'Marketing and SEO specialist.',
    'Frontend wizard.',
    'Backend automation master.'
];

const skillsList = ['React', 'Python', 'Node.js', 'Excel', 'Figma', 'Guitar', 'Photoshop', 'Cybersecurity', 'SQL', 'Django'];
const wantsList = ['Java', 'UI Design', 'Machine Learning', 'Blockchain', 'Dart', 'Linux', 'Firebase', 'DevOps', 'Swift', 'Public Speaking'];
const urls = [
    'https://github.com/user',
    'https://linkedin.com/in/user',
    'https://instagram.com/userprofile',
    'https://behance.net/user'
];
const genders = ['male', 'female', 'other'];
const citiesAndCountries = [
    { city: 'Istanbul', country: 'Turkey' },
    { city: 'Ankara', country: 'Turkey' },
    { city: 'Berlin', country: 'Germany' },
    { city: 'Munich', country: 'Germany' },
    { city: 'Paris', country: 'France' },
    { city: 'Lyon', country: 'France' },
    { city: 'Rome', country: 'Italy' },
    { city: 'Milan', country: 'Italy' },
    { city: 'Madrid', country: 'Spain' },
    { city: 'Barcelona', country: 'Spain' },
];

// Yardımcı fonksiyon
function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export const addFakeUsers = async (count = 10) => {
    const usedImages = new Set();
    const shuffledDescriptions = shuffle(descriptions);
    const shuffledLocations = shuffle(citiesAndCountries);
    const shuffledUrls = shuffle(urls);

    for (let i = 0; i < count; i++) {
        // Benzersiz random img numarası seç (1–70 arası)
        let imgNum;
        do {
            imgNum = Math.floor(1 + Math.random() * 70);
        } while (usedImages.has(imgNum));
        usedImages.add(imgNum);

        const uniqueName = `User${i + 1}_${Math.floor(100 + Math.random() * 900)}`; // Örn: User3_752

        const user = {
            name: uniqueName,
            description: shuffledDescriptions[i % shuffledDescriptions.length],
            skills: shuffle(skillsList).slice(0, 2),
            wantToLearn: shuffle(wantsList).slice(0, 2),
            urls: [shuffledUrls[i % shuffledUrls.length]],
            age: `${20 + Math.floor(Math.random() * 10)}`,
            gender: genders[i % genders.length],
            profileImage: `https://i.pravatar.cc/150?img=${imgNum}`,
            location: {
                latitude: 40.0 + Math.random(),
                longitude: 29.0 + Math.random()
            },
            country: shuffledLocations[i % shuffledLocations.length].country,
            city: shuffledLocations[i % shuffledLocations.length].city
        };

        try {
            await addDoc(collection(db, 'users'), user);
            console.log(`Fake user ${user.name} added`);
        } catch (err) {
            console.error(`Error adding ${user.name}:`, err);
        }
    }

    alert(`${count} fake users successfully added`);
};
