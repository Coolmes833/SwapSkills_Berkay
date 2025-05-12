import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../fireBase';

export const deleteAllUsers = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'users'));
        const batchSize = snapshot.size;

        if (batchSize === 0) {
            alert('Hiç kullanıcı bulunamadı.');
            return;
        }

        const deletions = snapshot.docs
            .filter(doc => doc.data().name.startsWith('User'))
            .map(doc => deleteDoc(doc.ref));


        await Promise.all(deletions);

        alert(` ${batchSize} kullanıcı başarıyla silindi!`);
    } catch (error) {
        console.error('Silme hatası:', error);
        alert('Kullanıcılar silinirken bir hata oluştu.');
    }
};
