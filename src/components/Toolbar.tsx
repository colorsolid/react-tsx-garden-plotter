import React, {ChangeEvent} from 'react';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

import {plantTypes} from '../Global';

const plantTypesKeys = Object.keys(plantTypes).sort();
plantTypesKeys.splice(0, 0, plantTypesKeys.splice(plantTypesKeys.indexOf('nothing'))[0]);

const plantAreas = [
    'add-plant-area',
    'remove-plant-area'
]

interface ToolBarProps {
    selectedType: string,
    selectedMode: string,
    hoverCoordinates: number[],
    hoverType: string,
    changeModeAndType: (type: string, mode: string) => void,
    clearSquares: () => void,
    selectionStarted: boolean,
    cancelSelection: () => void,
    isMobile: boolean
}

export function Toolbar(
    {
        selectedType,
        selectedMode,
        hoverCoordinates,
        hoverType,
        changeModeAndType,
        clearSquares,
        selectionStarted,
        cancelSelection,
        isMobile
    }: ToolBarProps) {
    return (
        <div id={'toolbar'} >
                        <Button variant={'danger'}
                                size={'sm'}
                                onClick={clearSquares}
                        >
                            clear
                        </Button>
                        {/*<div className={'toolbar-divider'}></div>*/}
                        Garden space:&nbsp;
                        {plantAreas.map((mode: string) =>
                            <Button variant={mode === selectedMode ? 'primary' : 'outline-dark'}
                                    size={'sm'}
                                    key={`btn-${mode}`}
                                    onClick={() => {
                                        changeModeAndType(selectedType, mode);
                                    }}
                            >
                                {mode.split('-')[0]}
                            </Button>
                        )}
                        {/*<div className={'toolbar-divider'}></div>*/}
                        <Button variant={selectedMode === 'plant' ? 'primary' : 'outline-dark'}
                                size={'sm'}
                                onClick={() => changeModeAndType((
                                    document.querySelector('#plant-select') as HTMLInputElement)!.value, 'plant')}
                        >
                            plant&nbsp;
                            <select
                                id={'plant-select'}
                                value={selectedType}
                                onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                                    changeModeAndType(event.target.value, 'plant')
                                }}
                            >
                                {plantTypesKeys.map((type: string) =>
                                    <option key={`option-${type}`}>
                                        {type}
                                    </option>
                                )}
                            </select>
                        </Button>
                        {isMobile && <Button
                            size={'sm'}
                            variant={selectedMode === 'inspect' ? 'primary' : 'outline-dark'}
                            onClick={() => changeModeAndType(selectedType, 'inspect')}
                        >
                            inspect
                        </Button>}
                        {
                            selectionStarted &&
                            <Button variant={'dark'} size={'sm'} onClick={() => cancelSelection()}>cancel</Button>
                        }
                        {/*<div className={'toolbar-divider'}></div>*/}
                        <span className={'toolbar-info'}>
                        <span
                            className={'coordinates'}>{hoverCoordinates ? '(' + hoverCoordinates.map(coordinate => coordinate + 1).reverse().join(', ') + ')' : ''}
                        </span>
                            &nbsp;{hoverType !== 'nothing' ? hoverType : ''}
                        </span>
        </div>
    );
}