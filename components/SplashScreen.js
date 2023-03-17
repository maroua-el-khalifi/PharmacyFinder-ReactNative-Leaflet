import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';

const Splash = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            navigation.replace('AppPage');
        }, 3000);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3721/3721710.png' }}
                style={styles.icon}
            />
            <Text style={styles.title}>Pharmacy Finder</Text>
            {isLoading && (
                <ActivityIndicator
                    size="large"
                    color="#020288"
                    style={{ marginTop: 80 }}
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
        backgroundColor: '#fff',
    },
    icon: {
        width: 100,
        height: 100,
    },
    title: {
        fontSize: 25,
        marginTop: 16,
        color: '#020288',
        fontWeight: 'bold'
    },
});

export default Splash;
