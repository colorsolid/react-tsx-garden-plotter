import React, {ChangeEvent} from 'react';
import Button from 'react-bootstrap/Button';

import {plantTypes} from '../Global';

const plantTypesKeys = Object.keys(plantTypes).sort();
plantTypesKeys.splice(0, 0, plantTypesKeys.splice(plantTypesKeys.indexOf('nothing'))[0]);

const plantAreas = [
    'add-plant-area',
    'remove-plant-area'
]

interface ToolBarProps {
    selectedType: string,
    changeType: (type: string) => void,
    clearSquares: () => void,
    selectionStarted: boolean,
    cancelSelection: () => void
}

export function Toolbar({selectedType, changeType, clearSquares, selectionStarted, cancelSelection}: ToolBarProps) {
    return (
        <div id={'toolbar'}>
            <Button
                onClick={clearSquares}
            >
                clear
            </Button>
            <div className={'toolbar-divider'}></div>
            Garden space:&nbsp;
            {plantAreas.map((type: string) =>
                <Button
                    key={`btn-${type}`}
                    className={type === selectedType ? 'btn selected' : 'btn'}
                    onClick={() => {
                        changeType(type)
                    }}
                >
                    {type.split('-')[0]}
                </Button>
            )}
            <div className={'toolbar-divider'}></div>
            <Button className={plantTypesKeys.includes(selectedType) ? 'selected' : ''}
                    onClick={() => changeType((
                        document.querySelector('#plant-select') as HTMLInputElement)!.value)}
            >
                plant&nbsp;
                <select
                    id={'plant-select'}
                    value={selectedType}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                        changeType(event.target.value)
                    }}
                >
                    {plantTypesKeys.map((type: string) =>
                        <option key={`option-${type}`}>
                            {type}
                        </option>
                    )}
                </select>
            </Button>
            {
                selectionStarted &&
                <button className={'btn'} onClick={() => cancelSelection()}>cancel</button>
            }
            <div className={'toolbar-divider'}></div>

        </div>
    );
}