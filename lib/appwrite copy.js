import {
    Account,
    Client,
    Databases,
    ID,
    Query,
    Storage,
} from 'react-native-appwrite';

export const config = {
    endpoint: 'https://your-appwrite-endpoint/v1',
    platform: 'com.your.app.id',
    projectId: 'your-project-id',
    storageId: 'your-storage-id',
    databaseId: 'your-database-id',
    userCollectionId: 'your-user-collection-id',
    pengeluaranCollectionId: 'your-pengeluaran-collection-id',
    pemasukanCollectionId: 'your-pemasukan-collection-id',
    jenisCollectionId: 'your-jenis-collection-id',
    jasaCollectionId: 'your-jasa-collection-id',
    hargaCollectionId: 'your-harga-collection-id'
}

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setPlatform(config.platform)
    ;

const account = new Account(client);
const storage = new Storage(client);
const databases = new Databases(client);

//Upload File
export async function uploadFile(file, type) {
    if (!file) return;

    const { mimeType, ...rest } = file;
    const asset = { type: mimeType, ...rest };

    try {
        const uploadedFile = await storage.createFile(
            config.storageId,
            ID.unique(),
            asset
        );

        const fileUrl = await getFilePreview(uploadedFile.$id, type);
        return fileUrl;

    } catch (error) {
        throw new Error(error);
    }
}


//Daftar akun baru
export async function daftarAkun(email, password, username, alamat, nomor, logo, laundry) {

    try {

        const [LogoUrl] = await Promise.all([
            uploadFile(logo, "image")
        ]);


        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username,
            nomor
        )

        if (!newAccount) throw Error;

        await masukLogin(email, password);

        const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                alamat,
                nomor,
                LogoUrl,
                laundry
            }
        )

        // Function buat bikin harga jasa default
        await createJasaDefault(newUser.$id);

        return newUser;
    } catch (error) {
        console.error("Registration failed:", error);
        throw new Error("An error occurred during account registration");
    }
}

//Default jasa
export async function createJasaDefault(userId) {
    try {
        const jasaDefault = [
            {
                keterangan: 'Cuci',
                nominal: '0',
                pemilik: userId
            },
            {
                keterangan: 'Cuci Komplit',
                nominal: '0',
                pemilik: userId
            },
            {
                keterangan: 'Setrika',
                nominal: '0',
                pemilik: userId
            },
            {
                keterangan: 'Koin',
                nominal: '0',
                pemilik: userId
            },
        ];

        const createdJasa = await Promise.all(
            jasaDefault.map(async (service) => {
                return await databases.createDocument(
                    config.databaseId,
                    config.jasaCollectionId,
                    ID.unique(),
                    service
                );
            })
        );

        return createdJasa;
    } catch (error) {
        console.error("Failed to create default services:", error);
        throw new Error("An error occurred while creating default services.");
    }
}

//Get Jasa
export async function getJasa(userId) {
    try {
        const jasaList = await databases.listDocuments(
            config.databaseId,
            config.jasaCollectionId,
            [
                Query.equal('pemilik', userId),
                Query.select(["$id", "keterangan", "nominal"])
            ]
        )

        return jasaList.documents;
    } catch (error) {
        console.error("Failed to retrieve jasa for user:", error);
        throw new Error("An error occurred while fetching jasa documents for the user.");
    }
}

//Update Jasa
export async function updateJasa(id, nominal) {
    try {
        const newJasa = await databases.updateDocument(
            config.databaseId,
            config.jasaCollectionId,
            id,
            {
                nominal
            }
        )
    } catch (error) {
        throw new Error(error)
    }
}

//Delete Jasa 
export async function deleteJasa(id) {
    try {
        const response = await databases.deleteDocument(
            config.databaseId,
            config.jasaCollectionId,
            id
        )
        return response;
    } catch (error) {
        throw new Error(error)
    }
}


//Get Harga
export async function getHarga(userId) {
    try {
        const hargaList = await databases.listDocuments(
            config.databaseId,
            config.hargaCollectionId,
            [
                Query.equal('pemilik', userId)
            ]
        )

        return hargaList.documents;
    } catch (error) {
        console.error("Failed to retrieve jasa for user:", error);
        throw new Error("An error occurred while fetching jasa documents for the user.");
    }
}


//Create Harga
export async function createHarga(keterangan, nominal, userId) {
    try {
        const newHarga = await databases.createDocument(
            config.databaseId,
            config.hargaCollectionId,
            ID.unique(),
            {
                keterangan,
                nominal,
                pemilik: userId,
            }
        )
        return newHarga;
    } catch (error) {
        throw new Error(error);
    }
}

//Update Harga
export async function updateHarga(id, keterangan, nominal) {
    try {
        const updatedHarga = await databases.updateDocument(
            config.databaseId,
            config.hargaCollectionId,
            id,
            {
                keterangan,
                nominal,
            }
        )
        return updatedHarga;
    } catch (error) {
        throw new Error(error);
    }
}

//Delete Harga
export async function deleteHarga(id) {
    try {
        const response = await databases.deleteDocument(
            config.databaseId,
            config.hargaCollectionId,
            id
        )
        return response;
    } catch {
        throw new Error(error)
    }
}

//Update Akun 
export async function editAkun(email, username, alamat, nomor, laundry) {
    try {

        const userDocuments = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('email', email)]
        );

        const userId = userDocuments.documents[0].$id;


        const newUpdate = await databases.updateDocument(
            config.databaseId,
            config.userCollectionId,
            userId,
            {
                email,
                username,
                alamat,
                nomor,
                laundry
            }
        )

        return newUpdate;
    } catch (error) {
        throw new Error(error);
    }
}

//Login
export async function masukLogin(email, password) {
    try {
        const session = await account.createEmailPasswordSession(email, password)

        return session;
    } catch (error) {
        throw new Error(error);
    }
}

//Get Account
export async function getAccount() {
    try {
        const currentAccount = await account.get();

        return currentAccount;
    } catch (error) {
        throw new Error(error);
    }
}

//Get Current User
export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [
                Query.equal('accountId', currentAccount.$id)
            ]
        )

        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
        return null;
    }
}

//Logout
export async function signOut() {
    try {
        const session = await account.deleteSession("current");

        return session;
    } catch (error) {
        throw new Error(error);
    }
}

//Get All Pemasukan
export async function getUserPemasukan(userId) {
    try {
        const pemasukan = await databases.listDocuments(
            config.databaseId,
            config.pemasukanCollectionId,
            [
                Query.equal('pemilik', userId)
            ]
        );

        return pemasukan.documents;
    } catch (error) {
        throw new Error(error);
    }
}

//Create Pemasukan 
export async function createPemasukan(tanggalmasuk, namapelanggan, nomorhp, alamatpelanggan, userId, jasaId, nominal, jasakuantitas, pakaianId, status, pakaianQty, jasaNominal, pakaianNominal) {
    try {
        const newPemasukan = await databases.createDocument(
            config.databaseId,
            config.pemasukanCollectionId,
            ID.unique(),
            {
                tanggalmasuk,
                namapelanggan,
                nomorhp,
                alamatpelanggan,
                pemilik: userId,
                jasa: jasaId,
                nominal,
                jasakuantitas,
                pakaian: pakaianId,
                status,
                pakaianQty,
                jasaNominal,
                pakaianNominal,
            }
        )
        return newPemasukan;
    } catch (error) {
        throw new Error(error)
    }
}

//Update Pemasukan 
export async function updatePemasukan(id, tanggalmasuk, namapelanggan, nomorhp, alamatpelanggan, status) {
    try {
        const newPemasukan = await databases.updateDocument(
            config.databaseId,
            config.pemasukanCollectionId,
            id,
            {
                tanggalmasuk,
                namapelanggan,
                nomorhp,
                alamatpelanggan,
                status
            }
        )
        return newPemasukan;
    } catch (error) {
        throw new Error(error)
    }
}

//Delete Pemasukan
export async function deletePemasukan(id) {
    try {
        const response = await databases.deleteDocument(
            config.databaseId,
            config.pemasukanCollectionId,
            id
        )
        return response;
    } catch (error) {
        throw new Error(error);
    }
}

//Get All Pengeluaran
export async function getUserPengeluaran(userId) {
    try {
        const pengeluaran = await databases.listDocuments(
            config.databaseId,
            config.pengeluaranCollectionId,
            [
                Query.equal('pemilik', userId)
            ]
        );


        return pengeluaran.documents;
    } catch (error) {
        throw new Error(error);
    }
}

//Create Pengeluaran
export async function createPengeluaran(Tanggal, keterangan, nominal, jenis, userId) {
    try {
        const newPengeluaran = await databases.createDocument(
            config.databaseId,
            config.pengeluaranCollectionId,
            ID.unique(),
            {
                Tanggal,
                keterangan,
                nominal,
                jenis,
                pemilik: userId,
            }
        );
        return newPengeluaran;
    } catch (error) {
        throw new Error(error);
    }
}


//Update Pengeluaran
export async function updatePengeluaran(id, Tanggal, keterangan, nominal, jenis) {
    try {

        const newUpdate = await databases.updateDocument(
            config.databaseId,
            config.pengeluaranCollectionId,
            id,
            {
                Tanggal,
                keterangan,
                nominal,
                jenis
            }
        )

        return newUpdate;
    } catch (error) {
        throw new Error(error);
    }
}

//Delete Pengeluaran
export async function deletePengeluaran(id) {
    try {
        const response = await databases.deleteDocument(
            config.databaseId,
            config.pengeluaranCollectionId,
            id
        )
        return response;
    } catch (error) {
        throw new Error(error);
    }
}

export async function getJenisDetails() {
    try {
        const jenisDetails = await databases.listDocuments(
            config.databaseId,
            config.jenisCollectionId
        );

        return jenisDetails.documents;
    } catch (error) {
        throw new Error(error);
    }
}


