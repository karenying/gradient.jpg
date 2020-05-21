import React from 'react';
import './App.css';
import Header from './Components/Header';
import HexPicker from './Components/HexPicker/HexPicker';
import Stack from './Components/Stack/Stack';
import Suggested from './Components/Suggested/Suggested';
import StopBar from './Components/StopBar/StopBar';
import CSS from './Components/CSS/CSS';
import Preview from './Components/Preview/Preview';
import { SUGGESTIONS } from './Utils/gradientConstants';
import { Color } from './Utils/Color';
import { shuffle } from './Utils/generalUtils';
import { IPHONE_10, IPHONE_6 } from './Utils/screenDimensionConstants';
import { MAX_SIZE, ENTER_KEY } from './Utils/inputConstants';

class App extends React.Component {
    state = {
        gradient: null,
        selected: 0, // color selected out of gradient
        width: 0,
        height: 0,
        suggestedSelected: '',
        suggested: [],
        stopValue: null,
        draggedColor: null,
    };

    componentWillMount() {
        let shuffledSuggested = shuffle(SUGGESTIONS);
        let shownSuggested = shuffledSuggested.slice(0, 4);
        let first = shownSuggested[0];

        this.setState({
            gradient: first.clone(),
            suggestedSelected: first.name,
            suggested: shownSuggested,
            width: IPHONE_6.width,
            height: IPHONE_6.height,
            stopValue: first.stack[0].stop,
        });
    }

    addColor = () => {
        const { gradient, selected } = this.state;
        let gradientCopy = gradient.clone();
        let { stack } = gradientCopy;

        if (stack.length < 5) {
            // set current selected as false
            stack[selected].selected = false;

            // recalculate stops
            stack.forEach((c) => {
                c.stop = Math.round((c.index / stack.length) * 100);
            });

            const defaultColor = new Color('ffffff', 100, true, stack.length);
            stack.push(defaultColor);

            this.setState({
                gradient: gradientCopy,
                selected: defaultColor.index,
                stopValue: 100,
            });
        }
    };

    deleteColor = (e, deletedIndex) => {
        const { gradient, selected } = this.state;
        let gradientCopy = gradient.clone();
        let { stack } = gradientCopy;

        this.unsetSuggested();

        if (stack.length > 2) {
            e.stopPropagation();

            // if deleting currently selected
            if (deletedIndex === selected) {
                let nextSelected;

                if (deletedIndex === stack.length - 1) {
                    // if deleting last one set selected as the one before
                    nextSelected = deletedIndex - 1;
                } else {
                    // else set selected as the one after
                    nextSelected = deletedIndex + 1;
                }
                stack[nextSelected].selected = true;
            }

            // if deleted is before selected
            if (deletedIndex <= selected) {
                // if not the first one, (if first one let remain the first selected)
                if (deletedIndex !== 0) {
                    // decrement selected by 1
                    this.setState((prevState, props) => ({
                        selected: prevState.selected - 1,
                    }));
                }
            }

            // if not deleting the last one
            if (deletedIndex !== stack.length - 1) {
                // decrement the index of all items after the deleted
                for (let i = deletedIndex + 1; i < stack.length; i++) {
                    stack[i].index--;
                }
            }

            // delete item
            stack.splice(deletedIndex, 1);

            this.setState({
                gradient: gradientCopy,
            });
        }
    };

    changeSelected = (index) => {
        const { gradient, selected } = this.state;
        const { stack } = gradient;
        let stackCopy = [...stack];

        // set curr selected to false
        stackCopy[selected].selected = false;

        // set arg to selected and change this.state.selected
        stackCopy[index].selected = true;

        this.setState((prevState) => ({
            gradient: {
                ...prevState.gradient,
                stack: stackCopy,
            },
            selected: index,
            stopValue: stackCopy[index].stop,
        }));
    };

    setSuggested = (e, suggestedName) => {
        e.stopPropagation();

        const { suggested } = this.state;

        let selectedGradient;
        /* iterate through suggested checking if the suggested's 
        name matches the one selected, if so, set 
        this.state.gradient as its clone */
        suggested.forEach((gradient) => {
            if (gradient.name === suggestedName) {
                let clone = gradient.clone();
                this.setState({ gradient: clone });
                selectedGradient = clone;
            }
        });

        this.setState({
            suggestedSelected: suggestedName,
            selected: 0,
            stopValue: selectedGradient.stack[0].stop,
        });
    };

    unsetSuggested = () => {
        const { suggestedSelected } = this.state;
        if (suggestedSelected) {
            this.setState({ suggestedSelected: '' });
        }
    };

    handleLinearRadialChange = () => {
        const { gradient } = this.state;
        let gradientCopy = gradient.clone();
        const change = !gradient.isLinear;
        gradientCopy.isLinear = change;

        this.setState({
            gradient: gradientCopy,
        });
    };

    handleCenterChange = (center) => {
        const { gradient } = this.state;
        let gradientCopy = gradient.clone();
        gradientCopy.center = center;

        this.setState({
            gradient: gradientCopy,
        });
    };

    handleWidthChange = (e) => {
        let { value } = e.target;

        if (value) {
            value = Number(value);
        }
        if (value <= MAX_SIZE) {
            this.setState({
                width: value,
            });
        }
    };

    handleHeightChange = (e) => {
        let { value } = e.target;

        if (value) {
            value = Number(value);
        }
        if (value <= MAX_SIZE) {
            this.setState({
                height: value,
            });
        }
    };

    handleDegreesChange = (e) => {
        let { value } = e.target;

        if (value) {
            value = Number(value);
        }

        if (value >= 0 && value < 360) {
            const { gradient } = this.state;
            let gradientCopy = gradient.clone();
            gradientCopy.degrees = value;

            this.setState({
                gradient: gradientCopy,
            });
        }
    };

    handleStopChange = (e) => {
        let { value } = e.target;
        const { gradient, selected } = this.state;

        if (value) {
            value = Number(value);
        }

        if (value >= 0 && value <= 100) {
            let gradientCopy = gradient.clone();
            let { stack } = gradientCopy;

            // update the value
            stack[selected].stop = value;

            // sort the stack in increasing order of stops
            let newSelected = gradientCopy.sortStack();

            this.setState({
                gradient: gradientCopy,
                selected: newSelected,
            });
        } else {
            this.setState({ stopValue: gradient.stack[selected].stop });
        }
    };

    handleKeyDown = (e) => {
        if (e.keyCode === ENTER_KEY) {
            this.handleStopChange(e);
        }
    };

    setValue = (stopValue) => {
        this.setState({ stopValue });
    };

    changeValue = (e) => {
        const { value } = e.target;
        this.setState({ stopValue: value });
    };

    // hasPound = true for stackItem, false for currentColor
    handleHexChange = (e, hasPound) => {
        let { value } = e.target;
        const { selected, gradient } = this.state;
        let gradientCopy = gradient.clone();

        if (hasPound) {
            value = value.substring(1);
        }

        gradientCopy.stack[selected].hex = value;

        this.setState({
            gradient: gradientCopy,
        });
    };

    onDragStart = (e, draggedColor) => {
        // step drag item to entire stack item, instead of just icon
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.parentNode);
        e.dataTransfer.setDragImage(e.target.parentNode, 20, 20);

        this.setState({
            draggedColor,
        });
    };

    onDragOver = (e, color) => {
        // let item drop where its dragged over
        e.preventDefault();

        const { gradient, draggedColor } = this.state;
        const gradientCopy = gradient.clone();
        const { stack } = gradientCopy;

        // if dragged over is same as dragged item
        if (draggedColor.isEqual(color)) {
            return;
        }

        // create stack without dragged item
        const newStack = stack.filter((color) => !color.isEqual(draggedColor));

        // insert dragged item
        newStack.splice(color.index, 0, draggedColor);

        // set indecies
        for (let i = 0; i < newStack.length; i++) {
            const color = newStack[i];
            color.index = i;
        }
        gradientCopy.stack = newStack;

        this.setState({ gradient: gradientCopy });
    };

    onDragEnd = () => {
        const { gradient, draggedColor } = this.state;
        const gradientCopy = gradient.clone();
        const { stack } = gradientCopy;
        let selected, stopValue;

        // save original stops
        let stops = stack
            .map((color) => color.stop)
            .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

        // update selected and stops
        for (let i = 0; i < stack.length; i++) {
            const color = stack[i],
                stop = stops[i];
            color.stop = stop;

            if (!color.isEqual(draggedColor)) {
                color.selected = false;
            } else {
                color.selected = true;
                selected = color.index;
                stopValue = stop;
            }
        }

        this.setState({
            draggedColor: null,
            gradient: gradientCopy,
            selected,
            stopValue,
        });
    };

    render() {
        const {
            gradient,
            suggestedSelected,
            suggested,
            selected,
            height,
            width,
            stopValue,
        } = this.state;
        const { stack } = gradient;
        const color = stack[selected];
        const colorwheelColor = color.getColorwheel();

        return (
            <div className='App' onClick={this.unsetSuggested}>
                <Header />
                <div className='container'>
                    <div className='wrapper'>
                        <div className='left'>
                            <StopBar gradient={gradient} />
                            <div className='color-picker'>
                                <div className='color-picker-left'>
                                    <HexPicker
                                        colorwheelColor={colorwheelColor}
                                        color={color}
                                        handleHexChange={this.handleHexChange}
                                    />
                                </div>
                                <div className='color-picker-right'>
                                    <Stack
                                        gradient={gradient}
                                        addColor={this.addColor}
                                        changeSelected={this.changeSelected}
                                        deleteColor={this.deleteColor}
                                        handleKeyDown={this.handleKeyDown}
                                        changeValue={this.changeValue}
                                        stopValue={stopValue}
                                        handleHexChange={this.handleHexChange}
                                        onDragStart={this.onDragStart}
                                        onDragOver={this.onDragOver}
                                        onDragEnd={this.onDragEnd}
                                    />
                                    <Suggested
                                        suggested={suggested}
                                        selected={suggestedSelected}
                                        setSuggested={this.setSuggested}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='wrapper'>
                        <div className='right'>
                            <Preview
                                gradient={gradient}
                                height={height}
                                width={width}
                                handleLinearRadialChange={
                                    this.handleLinearRadialChange
                                }
                                handleCenterChange={this.handleCenterChange}
                                handleWidthChange={this.handleWidthChange}
                                handleHeightChange={this.handleHeightChange}
                                handleDegreesChange={this.handleDegreesChange}
                            />
                            <CSS gradient={gradient} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
