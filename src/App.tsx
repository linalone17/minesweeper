import React from 'react';
import styles from './App.module.scss';
import {Game} from "./components/Game";

export default function App() {
    return (
        <div className={styles.App}>
            <Game/>
        </div>
    );
}

