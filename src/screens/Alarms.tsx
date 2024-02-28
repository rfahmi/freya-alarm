import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SquircleView} from 'react-native-figma-squircle';
import PushNotification from 'react-native-push-notification';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Alarm {
  id: string;
  time: Date;
}

const Alarms: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadAlarms();
  }, []);

  const loadAlarms = async () => {
    try {
      const storedAlarms = await AsyncStorage.getItem('alarms');
      if (storedAlarms !== null) {
        setAlarms(JSON.parse(storedAlarms));
      }
    } catch (error) {
      console.error('Error loading alarms', error);
    }
  };

  const saveAlarms = async (updatedAlarms: Alarm[]) => {
    try {
      await AsyncStorage.setItem('alarms', JSON.stringify(updatedAlarms));
      setAlarms(updatedAlarms);
    } catch (error) {
      console.error('Error saving alarms', error);
    }
  };

  const removeAlarm = async (id: string) => {
    const updatedAlarms = alarms.filter(alarm => alarm.id !== id);
    saveAlarms(updatedAlarms);
  };

  const addAlarm = (time: moment.Moment) => {
    const newAlarm: Alarm = {
      id: moment().valueOf().toString(),
      time: time.toDate(),
    };
    const updatedAlarms = [...alarms, newAlarm];
    saveAlarms(updatedAlarms);
  };

  const onChange = (event: any) => {
    const {
      type,
      nativeEvent: {timestamp},
    } = event;
    if (type === 'set') {
      const alarmDate = moment(timestamp);
      addAlarm(alarmDate);
    }
    setModalVisible(false);
  };

  const setRepeatingNotification = (data: Alarm[]) => {
    PushNotification.cancelAllLocalNotifications();
    data.map((alarm: Alarm) => {
      if (moment(alarm.time).toDate() > new Date()) {
        PushNotification.localNotificationSchedule({
          title: 'Freya Jayawadhana',
          message: 'Sahhhuuurrrr!!!!!',
          date: moment(alarm.time).toDate(),
          channelId: 'general',
          repeatType: 'time',
          repeatTime: 9 * 1000,
        });
      }
    });
  };

  useEffect(() => {
    setRepeatingNotification(alarms);
  }, [alarms]);

  return (
    <View style={styles.container}>
      <View style={styles.list}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <SquircleView
            style={styles.buttonPlus}
            squircleParams={{
              cornerSmoothing: 1,
              cornerRadius: 16,
              fillColor: '#444',
            }}>
            <Icon name="plus" size={24} color="#fff" />
            <Text style={{textAlign: 'center', fontWeight: 'bold'}}>
              Tambah Alarm
            </Text>
          </SquircleView>
        </TouchableOpacity>
      </View>
      <FlatList
        data={alarms}
        contentContainerStyle={{flex: 1}}
        renderItem={({item}) => (
          <SquircleView
            style={styles.alarmItem}
            squircleParams={{
              cornerSmoothing: 1,
              cornerRadius: 16,
              fillColor: '#666',
            }}>
            <Text style={styles.alarmText}>
              {moment(item.time).format('H:mm')}
            </Text>
            <TouchableOpacity onPress={() => removeAlarm(item.id)}>
              <Icon name="close" size={48} color="#333" />
            </TouchableOpacity>
          </SquircleView>
        )}
        ListEmptyComponent={() => (
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{fontSize: 18, color: '#aaa'}}>Belum Ada Alarm</Text>
          </View>
        )}
        keyExtractor={item => item.id}
        style={styles.list}
      />
      {modalVisible && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={onChange}
          positiveButton={{
            label: 'Set Alarm',
          }}
          negativeButton={{
            label: 'Batal',
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alarmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginVertical: 5,
    marginHorizontal: 16,
  },
  buttonPlus: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginVertical: 5,
    marginHorizontal: 16,
    gap: 8,
  },
  alarmText: {
    fontSize: 32,
    color: '#ddd',
  },
  removeText: {
    color: 'red',
  },
  list: {
    marginTop: 20,
    width: '100%',
  },
});

export default Alarms;
