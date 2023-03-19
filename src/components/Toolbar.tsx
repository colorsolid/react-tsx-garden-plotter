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
    selectedMode: string,
    hoverCoordinates: number[],
    hoverType: string,
    changeModeAndType: (type: string, mode: string) => void,
    clearSquares: () => void,
    selectionStarted: boolean,
    cancelSelection: () => void,
    isMobile: boolean,
    undo: { call: () => void, enabled: boolean },
    redo: { call: () => void, enabled: boolean }
    _import: { call: () => void, enabled: boolean },
    _export: { call: () => void, enabled: boolean },
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
        isMobile,
        undo,
        redo,
        _import,
        _export
    }: ToolBarProps) {
    return (
        <div id={'toolbar'}>
            {/*<div className={'toolbar-divider'}></div>*/}
            garden area:&nbsp;
            {plantAreas.map((mode: string) =>
                <Button variant={mode === selectedMode ? 'primary' : 'outline-light'}
                        size={'sm'}
                        key={`btn-${mode}`}
                        onClick={() => {
                            changeModeAndType(selectedType, mode);
                        }}
                >
                    {mode.split('-')[0]}
                </Button>
            )}
            <Button variant={'danger'}
                    size={'sm'}
                    onClick={clearSquares}
            >
                clear
            </Button>
            <Button variant={'dark'}
                    size={'sm'}
                    onClick={undo.call}
                    disabled={!undo.enabled}
            >
                undo
            </Button>
            <Button variant={'dark'}
                    size={'sm'}
                    onClick={redo.call}
                    disabled={!redo.enabled}
            >
                redo
            </Button>
            {isMobile && <Button
                size={'sm'}
                variant={selectedMode === 'inspect' ? 'primary' : 'outline-light'}
                onClick={() => changeModeAndType(selectedType, 'inspect')}
            >
                inspect
            </Button>}
            {/*<div className={'toolbar-divider'}></div>*/}
            <Button variant={selectedMode === 'plant' ? 'primary' : 'outline-light'}
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
            {
                selectionStarted &&
                <Button variant={'dark'} size={'sm'} onClick={() => cancelSelection()}>cancel</Button>
            }
            {/*<div className={'toolbar-divider'}></div>*/}
            <input id="file-upload" type="file" accept=".json"></input>
            <label htmlFor="file-upload" className="btn-block">
                <span className="btn btn-sm btn-outline-warning">import</span>
            </label>
            <Button size={'sm'} variant={'outline-warning'} onClick={_export.call}>Export</Button>
            <span className={'toolbar-info'}>
                        <span
                            className={'coordinates'}>{hoverCoordinates ? '(' + hoverCoordinates.map(coordinate => coordinate + 1).reverse().join(', ') + ')' : ''}
                        </span>
                &nbsp;{hoverType !== 'nothing' ? hoverType : ''}
            </span>
        </div>
    );
}