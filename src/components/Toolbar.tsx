import React, {ChangeEvent} from 'react';
import Button from 'react-bootstrap/Button';

import {plantTypes} from '../Global';
import {Dropdown, Tooltip} from "react-bootstrap";
import {OverlayTrigger} from "react-bootstrap";

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
    changeModeAndType: (mode: string, type: string) => void,
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
            <input id="file-upload" type="file" accept=".json"></input>
            <label htmlFor="file-upload" className="d-none">
                <span>import</span>
            </label>
            <Dropdown>
                <Dropdown.Toggle variant={'dark'} size={'sm'} id={'toolbar-dropdown'}>
                </Dropdown.Toggle>
                <Dropdown.Menu variant={'dark'}>
                    <Dropdown.Item>
                        <div onClick={clearSquares}>clear</div>
                    </Dropdown.Item>
                    <Dropdown.Divider/>
                    <Dropdown.Item>
                        <div onClick={() => document.getElementById('file-upload')!.click()}>import</div>
                    </Dropdown.Item>
                    <Dropdown.Item>
                        <div onClick={_export.call}>export</div>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>

            <OverlayTrigger placement={'bottom'} overlay={<Tooltip>undo</Tooltip>}>
                <Button variant={'dark'}
                        size={'sm'}
                        onClick={undo.call}
                        disabled={!undo.enabled}
                >
                    ↶
                </Button>
            </OverlayTrigger>
            <OverlayTrigger placement={'bottom'} overlay={<Tooltip>redo</Tooltip>}>
                <Button variant={'dark'}
                        size={'sm'}
                        onClick={redo.call}
                        disabled={!redo.enabled}
                >
                    ↷
                </Button>
            </OverlayTrigger>
            {/*<div className={'toolbar-divider'}></div>*/}
            <Button
                variant={['add-plant-area', 'remove-plant-area'].includes(selectedMode) ? 'dark' : 'outline-dark'}
                size={'sm'}
                onClick={() => changeModeAndType((document.getElementById('garden-mode-select') as HTMLSelectElement)!.value, selectedType)}
            >
                garden area:&nbsp;
                <select
                    id={'garden-mode-select'}
                    value={selectedMode}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                        console.log(event.target.value)
                        changeModeAndType(event.target.value, selectedType)
                    }}
                >
                    <option key={'option-add-plant-area'} value={'add-plant-area'}>
                        Add
                    </option>
                    <option key={'option-remove-plant-area'} value={'remove-plant-area'}>
                        Remove
                    </option>
                </select>
            </Button>
            {/*<div className={'toolbar-divider'}></div>*/}
            <Button variant={selectedMode === 'plant' ? 'dark' : 'outline-dark'}
                    size={'sm'}
                    onClick={() => changeModeAndType('plant', (
                        document.querySelector('#plant-select') as HTMLInputElement)!.value)}
            >
                plant&nbsp;
                <select
                    id={'plant-select'}
                    value={selectedType}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                        changeModeAndType('plant', event.target.value)
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
                onClick={() => changeModeAndType('inspect', selectedType)}
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