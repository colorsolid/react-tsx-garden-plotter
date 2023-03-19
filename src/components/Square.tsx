import React from 'react';
import {SquareObject} from '../Global';


interface SquareProps {
    onClick: (rowIndex: number, squareIndex: number) => void,
    onMouseOver: (rowIndex: number, squareIndex: number) => void,
    rowIndex: number,
    squareIndex: number,
    square: SquareObject
}

export function Square({onClick, onMouseOver, rowIndex, squareIndex, square}: SquareProps) {
    return (
        <div
            className={
                `square 
                ${square.type.replace(' ', '-')} 
                ${square.highlight ? 'highlight' : ''} 
                ${square.plantArea ? 'plant-area' : ''}
                ${square.hasOwnProperty('border') ? square.border.join(' ') : []}`
            }
            onClick={() => {
                onClick(rowIndex, squareIndex);
            }}
            onMouseOver={() => {
                onMouseOver(rowIndex, squareIndex);
            }}
        >
            {(square.compatibility !== null && square.compatibility < 0) && '✕'}
            {(square.compatibility !== null && square.compatibility > 0) && '◯'}
            {square.compatibility === 0 && '•'}
        </div>
    );
}