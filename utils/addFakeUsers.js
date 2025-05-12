import { collection, addDoc } from 'firebase/firestore';
import { db } from '../fireBase';

const randomName = () => `User${Math.floor(Math.random() * 10000)}`;
const randomDesc = () => {
    const options = ['Yazılımcı', 'Tasarımcı', 'Müzisyen', 'Eğitmen', 'Danışman'];
    return options[Math.floor(Math.random() * options.length)];
};
const randomSkill = () => {
    const skills = ['React', 'Node.js', 'Python', 'Excel', 'Keman', 'Photoshop', 'Siber Güvenlik'];
    return skills[Math.floor(Math.random() * skills.length)];
};

export const addFakeUsers = async (count = 1) => {
    for (let i = 0; i < count; i++) {
        const user = {
            name: randomName(),
            description: randomDesc(),
            skills: randomSkill(),
            profileImage: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}` // 1-70 arası avatarlar
        };

        try {
            await addDoc(collection(db, 'users'), user);
            console.log(`✅ Fake user ${i + 1} eklendi`);
        } catch (err) {
            console.error(`❌ Hata ${i + 1}:`, err);
        }
    }

    alert(`${count} sahte kullanıcı başarıyla eklendi 🚀`);
};
