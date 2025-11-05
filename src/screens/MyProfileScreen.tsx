import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations';
import { SafeAreaView } from 'react-native-safe-area-context';

type MyProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MyProfileScreen'>;



const connectedMembers = [
  { id: '1', initials: 'DT', name: 'David Turner', relation: 'Son' },
  { id: '2', initials: 'LD', name: 'Lucas Dubois', relation: 'Friend' },
];

interface AvatarProps {
  initials: string;
  size?: number;
  fontSize?: number;
  style?: any;
}

interface InfoItemProps {
  iconName: any;
  text: string;
}

interface MemberCardProps {
  member: {
    id: string;
    initials: string;
    name: string;
    relation: string;
  };
}

const Avatar = ({ initials, size = 50, fontSize = 20, style }: AvatarProps) => (
  <View style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }, style]}>
    <Text style={[styles.avatarText, { fontSize: fontSize }]}>{initials}</Text>
  </View>
);

const InfoItem = ({ iconName, text }: InfoItemProps) => (
  <View style={styles.infoItem}>
    <Image 
      source={iconName} 
      style={styles.infoIcon} 
      resizeMode="contain"
    />
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

const MemberCard = ({ member }: MemberCardProps) => (
  <View style={styles.memberCard}>
    <Avatar initials={member.initials} size={40} fontSize={16} />
    <View style={styles.memberDetails}>
      <Text style={styles.memberName}>{member.name}</Text>
      <Text style={styles.memberRelation}>{member.relation}</Text>
    </View>
    <TouchableOpacity style={styles.editIconContainer}>
      <Image 
        source={require('../assets/setting.png')} 
        style={styles.editIcon} 
        resizeMode="contain"
      />
    </TouchableOpacity>
  </View>
);

const MyProfileScreen = () => {
  const navigation = useNavigation<MyProfileScreenNavigationProp>();
  const [userData, setUserData] = useState({
    initials: 'U',
    name: 'User',
    email: '',
    dob: '',
    gender: '',
    phone: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const phone = await AsyncStorage.getItem('userPhone');
      const firstName = await AsyncStorage.getItem('firstName');
      const lastName = await AsyncStorage.getItem('lastName');
      const email = await AsyncStorage.getItem('email');
      const dob = await AsyncStorage.getItem('dateOfBirth');
      const gender = await AsyncStorage.getItem('gender');
      
      const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || 'User';
      const initials = firstName && lastName ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() : firstName ? firstName.charAt(0).toUpperCase() : 'U';
      
      setUserData({
        initials,
        name: fullName,
        email: email || '',
        dob: dob || '',
        gender: gender || '',
        phone: phone || '',
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Avatar 
            initials={userData.initials} 
            size={80} 
            fontSize={30} 
            style={styles.mainAvatar} 
          />
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>

          <View style={styles.userInfoRow}>
            <InfoItem iconName={require('../assets/locationpin.png')} text={userData.dob} />
            <View style={styles.infoSeparator} />
            <InfoItem iconName={require('../assets/myprofile.png')} text={userData.gender} />
            <View style={styles.infoSeparator} />
            <InfoItem iconName={require('../assets/notification_pin.png')} text={userData.phone} />
          </View>

          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.connectedMembersSection}>
          <Text style={styles.sectionTitle}>Connected Members</Text>
          <FlatList
            data={connectedMembers}
            renderItem={({ item }) => <MemberCard member={item} />}
            keyExtractor={item => item.id}
            scrollEnabled={false} 
          />
          <TouchableOpacity style={styles.addMembersButton}>
            <Text style={styles.addMembersButtonText}>Add Members</Text>
          </TouchableOpacity>
        </View>


      </ScrollView>


    </SafeAreaView>
  );
};

export default MyProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mainAvatar: {
    marginBottom: 15,
  },
  avatarContainer: {
    backgroundColor: '#E0E0E0', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#666',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  infoIcon: {
    width: 16,
    height: 16,
    marginRight: 5,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
  infoSeparator: {
    width: 1,
    height: 16,
    backgroundColor: '#CCC',
    marginHorizontal: 10,
  },
  editProfileButton: {
    backgroundColor: '#F0F0F0', 
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  editProfileButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  connectedMembersSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  memberDetails: {
    flex: 1,
    marginLeft: 15,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  memberRelation: {
    fontSize: 13,
    color: '#666',
  },
  editIconContainer: {
    padding: 10,
  },
  editIcon: {
    width: 20,
    height: 20,
  },
  addMembersButton: {
    backgroundColor: '#F0F0F0', 
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#CCC',
    alignItems: 'center',
    marginTop: 15,
  },
  addMembersButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },


});