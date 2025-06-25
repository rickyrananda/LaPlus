import { useState, React} from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Button, Alert, Linking} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { getDetailItem, setDetailItem } from '../app/tempStorage';
import {  ArrowLeftCircleIcon, ShareIcon,ClipboardDocumentIcon, PrinterIcon, PencilSquareIcon, TrashIcon } from 'react-native-heroicons/solid'
import { router } from 'expo-router'
import { useGlobalContext } from '../context/GlobalProvider'
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Clipboard from 'expo-clipboard';
import { deletePemasukan, getUserPemasukan } from '../lib/appwrite';
import useAppwrite from '../lib/useAppwrite'


const DetailInvoice = () => {
    const item = getDetailItem();
    const { user } = useGlobalContext();
    const [pdfUri, setPdfUri] = useState(null);
    const { refetch: refetchPemasukan } = useAppwrite(() => getUserPemasukan(user.$id));


    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR' 
        }).format(amount);
      };
    const formatName = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric', year: 'numeric',  hour: '2-digit', minute: '2-digit',  hour12: false}).replaceAll(/[,\/\s:]+/g, '');
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',  hour12: false}).replaceAll(".", ":");
    };
    const handleEdit = (item) => {
        setDetailItem(item);
        router.push("/editInvoice");
      }
    const handleDelete = (itemId) => {
        Alert.alert("Hapus", "Apakah anda yakin ingin menghapus ini?", [
          { text: "Kembali", style: "cancel" },
          { text: "Delete", onPress: async () => {
              try {
                await deletePemasukan(itemId); 
                Alert.alert("Success", "Pemasukan berhasil dihapus.");
                router.replace('/invoice')
                await refetchPemasukan();
              } catch (error) {
                Alert.alert("Error", error.message);
              }
          }},
        ]);
      };
    
    // Generate PDF from HTML content
    const generatePDF = async () => {
        const pakaianItemsHTML = item.pakaian.map((pakaianItem, index) => {
            return `
                <div style="margin-top: 8px;">
                    <p class="bold">${pakaianItem.keterangan}</p>
                    <p class="split"><span>${item.pakaianqty[index]} x @${formatRupiah(pakaianItem.nominal)}</span> ${formatRupiah(parseInt(pakaianItem.nominal) * item.pakaianqty[index])}</p>
                </div>
            `;
        }).join('');

        const jasaItemsHTML = item.jasa ? `
            <p class="bold">${item.jasa}</p>
            <p class="split"><span>${jasaQty} ${item.jasa === "Koin" ? "Koin" : "Kg"} x @${formatRupiah(jasaNominal)}</span> ${formatRupiah(totalJasaHarga)}</p>
        ` : "";

        const htmlContent = `
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .header, .footer { text-align: center; margin-bottom: 10px;}
                        .footer { font-size: 10px; color: #888; position: fixed; bottom: 0; left: 0; text-align: center; width: 100%;}
                        .status { font-weight: bold; padding: 4px 8px; border-radius: 4px; }
                        .status-paid { color: green; border: 1px solid green; }
                        .status-unpaid { color: red; border: 1px solid red; }
                        .content { margin-top: 20px; }
                        .content p { margin: 4px 0; font-size: 12px; }
                        .border-bottom { border-bottom: 2px dashed #000; margin: 10px 0; }
                        .total { font-size: 16px; font-weight: bold; text-align: right; }
                        .split { display: flex; justify-content: space-between;}
                        .font { font-size:16px; margin-top: -12px;}
                        .h1 {
                          font-size: 2rem;
                          line-height: normal;
                          font-weight: bold;
                          margin: 0;
                        }
                        .bold {
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <p class="h1">${user.laundry}<p>
                        <p class="font">${user.alamat}</p>
                        <p class="font">Nomor: ${user.nomor}</p>
                        <span class="status ${item.status ? 'status-paid' : 'status-unpaid'}">
                            ${item.status ? 'LUNAS' : 'BELUM BAYAR'}
                        </span>
                    </div>
                    <div class="content">
                        <p class="split"><span>Tanggal: </span><span class="bold">${formatDate(item.date)}</span></p>
                        <p class="split"><span>No. Invoice: </span><span class="bold">#INV${formatName(item.date)}</span></p>
                        <p class="split"><span>Pelanggan: </span><span class="bold">${item.customerName} (${item.nomorhp})</span></p>
                        <p class="split"><span>Alamat: </span><span class="bold">${item.alamat}</span></p>
                        <div class="border-bottom"></div>

                        ${jasaItemsHTML}
                        ${pakaianItemsHTML}
                        <div class="border-bottom"></div>
                        <div class="total">TOTAL: ${formatRupiah(item.amount)}</div>
                    </div>
                    <div class="footer">Created with 💙 by LaPlus</div>
                </body>
            </html>
        `;
        

        try {
            const { uri } = await Print.printToFileAsync({ 
                html: htmlContent,
                width: 200,   
                height: 400,
             });
            setPdfUri(uri);
            const customFilename = `E-INV${formatName(item.date)}_${item.customerName}.pdf`;
            const filePath = `${FileSystem.documentDirectory}${customFilename}`;
            await FileSystem.moveAsync({
                from: uri,
                to: filePath,
            });

            return filePath;
        } catch (error) {
            console.error('Error generating PDF:', error);
        }

    };
    //Printer 
    
    const printPDF = async () => {
        if (pdfUri) {
            await Print.printAsync({ uri: pdfUri });
        } else {
            Alert.alert('Error', 'Please generate the PDF first');
        }
    };

    const sendWhatsAppMessage = async() => {
        const message = `Hi, here is the invoice you requested.`;
        try {
            const filePath = await generatePDF(); 
            if(filePath){
                await Sharing.shareAsync(filePath, {
                    UTI: 'com.adobe.pdf',
                    dialogTitle: 'Share Invoice',
                    mimeType: 'application/pdf',
                    message: message, 
                });
            }else {
                console.error('Generated PDF path is null, unable to share.');
            }
        } catch (error) {
            console.error('Error sending PDF via WhatsApp:', error);
        }
    };

    const jasaQty = Number.parseFloat(item.jasaqty);
    const jasaNominal = Number.parseInt(item.jasaNominal);
    const totalJasaHarga = jasaQty * jasaNominal;

    // const renderPakaian = () => {
    //     if (item && item.pakaian && item.pakaian.length > 0) {
    //         return item.pakaian.map((pakaianItem,index) => {
    //             return (
    //                 <View key={index} className="mt-2">
    //                     <Text className="text-sm font-isemibold">{pakaianItem.keterangan}</Text>
    //                     <View className="flex flex-row justify-between items-end space-x-1">
    //                         <Text className="text-xs font-isemibold">{item.pakaianqty[index]} x @{pakaianItem.nominal}</Text>
    //                         <View className="flex-1 border-Hitam-4 border-b-[1px] border-dashed mb-1"></View>
    //                         <Text className="text-sm font-isemibold">{formatRupiah(Number.parseInt(pakaianItem.nominal)*Number.parseInt(item.pakaianqty[index]))}</Text>
    //                     </View>
    //                 </View>
    //             )
    //         })   
    //       } else {
    //         return <Text>Tidak ada pakaian</Text>
    //       }
    // }

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(item.nomorhp);
      };

    const renderCard = () => {
        if  (item) {
            return (
            <View className="px-4">
                <View className="bg-white rounded-lg px-6 pt-6 pb-3 flex items-center">
                    <Text className="text-2xl font-ibold">{user.laundry.toUpperCase()}</Text>
                    <Text className="text-center text-xs w-[70%]">{user.alamat}</Text>
                    <Text className="text-xs mb-4">Nomor : {user.nomor}</Text>
                    <Text className={`min-w-[75px] bg-white rounded px-8 py-0.5 text-sm font-isemibold border ${item.status === true ? 'text-Hijau border-Hijau' :'text-Secondary border-Secondary'}`}>{item.status ? "LUNAS" : "BELUM BAYAR"}</Text>
                    <View className="w-full mt-4 space-y-1">
                        <Text className="text-xs font-iregular">Tanggal : {formatDate(item.date)}</Text>
                        <Text className="text-xs font-iregular">No. Invoice : #INV{formatName(item.date)}</Text>
                        <View className="flex flex-row items-center">
                            <Text className="text-xs">Pelanggan : </Text>
                            <View className="flex-row items-end space-x-1">
                                <Text className="text-sm font-ibold">{item.customerName}</Text> 
                                <TouchableOpacity
                                className="items-center"
                                onPress={copyToClipboard}
                                >
                                <Text className="text-xs font-ibold">( {item.nomorhp}<ClipboardDocumentIcon color="#333" height={12}/>)</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text className="text-xs font-iregular">Alamat : {item.alamat}</Text>
                    </View>
                    <View className="w-full border-b-[1px] border-dashed mt-4"></View>
                    <View className="w-full">
                        { item.jasa && (
                            <View className="mt-4">
                                <Text className="text-sm font-isemibold">{item.jasa}</Text>
                                <View className="flex flex-row justify-between items-end space-x-1">
                                    <Text className="text-xs font-iregular">{item.jasaqty} {item.jasa === "Koin" ? "Koin" : "Kg"} x @{jasaNominal}{item.jasa === "Koin" ? "/Koin" : "/Kg"}</Text>
                                    <View className="flex-1 border-Hitam-4 border-b-[1px] border-dashed mb-1"></View>
                                    <Text className="text-sm font-isemibold">{formatRupiah(totalJasaHarga)}</Text>
                                </View>
                            </View>
                        )}
                        {item.pakaian.map((pakaianItem,index) => (
                        <View key={index} className="mt-2">
                            <Text className="text-sm font-isemibold">{pakaianItem.keterangan}</Text>
                            <View className="flex flex-row justify-between items-end space-x-1">
                                <Text className="text-xs font-iregular">{item.pakaianqty[index]} Qty x @{item.pakaianNominal[index]}</Text>
                                <View className="flex-1 border-Hitam-4 border-b-[1px] border-dashed mb-1"></View>
                                <Text className="text-sm font-isemibold">{formatRupiah(Number.parseInt(item.pakaianNominal[index])*Number.parseInt(item.pakaianqty[index]))}</Text>
                            </View>
                        </View> 
                        ))}
                    </View>
                    <View className="w-full border-b-0.5 mt-4"></View>
                    <View className="flex flex-row justify-between items-center space-x-1 mt-4 mb-8">
                        <Text className="flex-1 text-sm font-isemibold">TOTAL</Text>
                        <Text className="text-base font-isemibold">{formatRupiah(item.amount)}</Text>
                    </View>
                    <Text className="text-[10px]">Created with 💙 by LaPlus</Text>
                </View>
            </View>
            )
        }
        return <Text>Empty </Text>
    
    
    }


    

    return (
        <SafeAreaView className="bg-Primary-2 h-full p-4">
        <View className="flex flex-row items-center justify-between mb-6">
            <TouchableOpacity
                onPress={router.back}
                >
            <ArrowLeftCircleIcon color="#FFF" width={32} height={32} />  
            </TouchableOpacity>
            <Text
                className="text-2xl text-white font-isemibold ml-[-40px]"
                >Detail Invoice</Text>
            <View></View>
        </View>
        {renderCard()}
        <View className="px-4 mt-4 items-center">
            <View className="w-50% flex-row bg-white rounded-lg px-10 py-2 space-x-10">
                <TouchableOpacity
                    className="flex-row space-x-2 h-6 items-center justify-start"
                    onPress={() => (handleEdit(item))}
                >
                    <PencilSquareIcon color="#555" width={16} height={16} />
                </TouchableOpacity>
                <TouchableOpacity
                    className="h-6 justify-center"
                    onPress={sendWhatsAppMessage}
                >
                    <ShareIcon color="#555" width={16} height={16} /> 
                </TouchableOpacity>
                <TouchableOpacity
                    className="h-6 justify-center"
                    onPress={() => handleDelete(item.id)}
                >
                    <TrashIcon color="#E14747" width={16} height={16} /> 
                </TouchableOpacity>
            </View>
            
        </View>
        </SafeAreaView>
    );
}


export default DetailInvoice;
