import React, {ChangeEvent} from 'react';
import Button from 'react-bootstrap/Button';

import {plantTypes} from '../Global';
import {Dropdown, Tooltip} from "react-bootstrap";
import {OverlayTrigger} from "react-bootstrap";
import {ReactComponent} from "*.svg";

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
        _export
    }: ToolBarProps) {

    const optionsDropdown = () => {
        return (
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
        );
    }

    const undoAndRedo = () => {
        return (
            <React.Fragment>
                <OverlayTrigger placement={'bottom'} overlay={<Tooltip>Undo</Tooltip>}>
                    <Button variant={'dark'}
                            size={'sm'}
                            onClick={undo.call}
                            disabled={!undo.enabled}
                    >
                        ↶
                    </Button>
                </OverlayTrigger>
                <OverlayTrigger placement={'bottom'} overlay={<Tooltip>Redo</Tooltip>}>
                    <Button variant={'dark'}
                            size={'sm'}
                            onClick={redo.call}
                            disabled={!redo.enabled}
                    >
                        ↷
                    </Button>
                </OverlayTrigger>
            </React.Fragment>
        );
    }

    const gardenToolSelector = () => {
        const plantAreaToolSelected = ['add-plant-area', 'remove-plant-area'].includes(selectedMode);

        return (
            <Button
                variant={plantAreaToolSelected ? 'dark' : 'outline-dark'}
                size={'sm'}
                onClick={() => changeModeAndType(
                    (document.getElementById('garden-mode-select') as HTMLSelectElement)!.value, selectedType
                )}
                className={'fw-bold'}
            >
                garden area&nbsp;
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
        );
    }

    const plantToolSelector = () => {
        return (
            <Button variant={selectedMode === 'plant' ? 'dark' : 'outline-dark'}
                    size={'sm'}
                    onClick={() => changeModeAndType('plant', (
                        document.querySelector('#plant-select') as HTMLInputElement)!.value)}
                    className={'fw-bold'}
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
                        <option value={type} key={`option-${type}`}>
                            {(type === 'nothing' ? '-- ' : '') + type.charAt(0).toUpperCase() + type.slice(1)
                            + (type === 'nothing' ? ' --' : '')}

                        </option>
                    )}
                </select>
            </Button>
        );
    }

    return (
        <div id={'toolbar'}>
            <input id="file-upload" type="file" accept=".json"></input>
            <label htmlFor="file-upload" className="d-none">
                <span>import</span>
            </label>

            {optionsDropdown()}
            {undoAndRedo()}
            {gardenToolSelector()}
            {plantToolSelector()}

            {isMobile && <Button
                size={'sm'}
                variant={selectedMode === 'inspect' ? 'dark' : 'outline-dark'}
                onClick={() => changeModeAndType('inspect', selectedType)}
            >
                inspect
            </Button>}
            <div className={'toolbar-info'}>
                <div
                    className={'coordinates'}>{
                    hoverCoordinates ? '(' + hoverCoordinates
                        .map(coordinate => coordinate + 1).reverse().join(', ') + ')' : ''
                }
                </div>
                <div>{hoverType !== 'nothing' ? hoverType : '_'}</div>
            </div>
            {
                selectionStarted &&
                <Button variant={'dark'} size={'sm'} onClick={() => cancelSelection()}>cancel</Button>
            }
        </div>
    );
}