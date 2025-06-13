import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link, router, useRouter } from 'expo-router'
import { styles } from "@/assets/styles/home.styles"
import { Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native'
import { SignOutButton } from '@/components/SignOutButton'
import useTransaction from '../../hooks/useTransaction'
import { useEffect, useState } from 'react'
import PageLoader from '../../components/PageLoader'
import {Ionicons} from '@expo/vector-icons'
import BalanceCard from '../../components/BalanceCard'
import TransactionItem from '../../components/TransactionItem' 
import NoTransactionFound from '../../components/NoTransactionFound'


export default function Page() {
  const { user } = useUser()
  const router = useRouter();
  const [refreshing,setRefreshing] = useState(false);
  const {transactions,summary,isloading,deleteTransaction,loadData} = useTransaction(user.id)

  const onRefresh = async() => {
    setRefreshing = true;
    await loadData();
    setRefreshing = false;
  }

  useEffect(()=>{
    loadData()
  },[loadData]);

  const handleDelete = (id) =>{
    Alert.alert("Delete Transaction", "Are you sure you want to delete this transaction",[
      {text:"Cancel", style:"cancel"},
      {text : "Delete", style:"destructive", onPress: ()=> deleteTransaction(id)}
    ])
  }

  if (isloading && !refreshing) {
    return <PageLoader />
  }

  return (
    <View style = {styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style = {styles.header}>
          {/*left side*/}
          <View style = {styles.headerLeft}>
            <Image
              source={require('@/assets/images/react-logo.png')}
              style={styles.headerLogo}
              resizeMode='contain'
            />
            <View style = {styles.welcomeContainer}>
              <Text style = {styles.welcomeText}>Welcome,</Text>
              <Text style = {styles.usernameText}>
                {user?.emailAddresses[0]?.emailAddress.split('@')[0]}
              </Text>
            </View>
          </View>
          {/*right side*/}
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push('/create')}>
              <Ionicons name="add" size={20} color="#FFF"/>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <SignOutButton />
          </View>
        </View>

        <BalanceCard summary={summary}/>

        <View style={styles.transactionsHeaderContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>

      </View>

      
      <FlatList 
        style = {styles.transactionList}
        contentContainerStyle = {styles.transactionListContent}
        data={transactions}   
        renderItem={({item})=> <TransactionItem item = {item} onDelete = {handleDelete} />}     
        ListEmptyComponent={<NoTransactionFound/>}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
      />
    </View>
  )
}