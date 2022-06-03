import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
} from 'react-native';

import Login from './src/components/Login';
import TaskList from './src/components/TaskList';

import firebase from './src/services/firebaseConnection';
import Feather from 'react-native-vector-icons/Feather';

export default function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const inputRef = useRef(null);
  const [key, setKey] = useState('');

  useEffect(() => {
    function getUser() {
      if (!user) {
        return;
      }

      firebase
        .database()
        .ref('tasks')
        .child(user)
        .once('value', snapshot => {
          setTasks([]);

          snapshot?.forEach(childItem => {
            let data = {
              key: childItem.key,
              name: childItem.val().name,
            };
            setTasks(oldTasks => [...oldTasks, data]);
          });
        });
    }
    getUser();
  }, [user]);

  async function handleAdd() {
    if (newTask === '') {
      return;
    }

    // Usuário quer editar uma tarefa.
    if (key !== '') {
      await firebase
        .database()
        .ref('tasks')
        .child(user)
        .child(key)
        .update({
          name: newTask,
        })
        .then(() => {
          const taskIndex = tasks.findIndex(item => item.key === key);
          const taskClone = tasks;
          taskClone[taskIndex].name = newTask;
          setTasks([...taskClone]);
        });

      Keyboard.dismiss();
      setNewTask('');
      setKey('');
      return;
    }

    let task = await firebase.database().ref('tasks').child(user);
    let childKey = task.push().key;

    task
      .child(childKey)
      .set({
        name: newTask,
      })
      .then(() => {
        const data = {
          key: childKey,
          name: newTask,
        };
        setTasks(oldTasks => [...oldTasks, data]);
      });
    Keyboard.dismiss();
    setNewTask('');
  }

  function handleDelete(key) {
    firebase
      .database()
      .ref('tasks')
      .child(user)
      .child(key)
      .remove()
      .then(() => {
        const findTasks = tasks.filter(item => item.key !== key);
        setTasks(findTasks);
      });
  }

  function handleEdit(data) {
    setKey(data.key);
    setNewTask(data.name);
    inputRef.current.focus();
  }

  function cancelEdit() {
    setKey('');
    setNewTask('');
    Keyboard.dismiss();
  }

  if (!user) {
    return <Login changeStatus={user => setUser(user)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {key.length > 0 && (
        <View style={{flexDirection: 'row', marginBottom: 8}}>
          <TouchableOpacity onPress={cancelEdit}>
            <Feather name="x-circle" size={20} color="#ff0000" />
          </TouchableOpacity>
          <Text style={{marginLeft: 5, color: '#ff0000'}}>
            Você está editando uma tarefa!
          </Text>
        </View>
      )}

      <View style={styles.containerTask}>
        <TextInput
          style={styles.input}
          placeholder="O que vai fazer hoje?"
          value={newTask}
          onChangeText={text => setNewTask(text)}
          ref={inputRef}
        />
        <TouchableOpacity style={styles.buttonAdd} onPress={handleAdd}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item.key}
        renderItem={({item}) => (
          <TaskList
            data={item}
            deleteItem={handleDelete}
            editeItem={handleEdit}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    paddingHorizontal: 10,
    backgroundColor: '#f1f6fc',
  },
  containerTask: {
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#141414',
    height: 45,
  },
  buttonAdd: {
    backgroundColor: '#141414',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
    paddingHorizontal: 14,
    borderRadius: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 22,
  },
});
