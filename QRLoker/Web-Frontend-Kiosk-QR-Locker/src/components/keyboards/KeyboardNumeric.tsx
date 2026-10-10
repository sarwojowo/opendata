import { useState, type ChangeEvent, useImperativeHandle, useRef, type RefObject } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import './keyboard.css'

interface IProps {
    inputName: string
    onValuesChange: (inputs: any) => any
    onSubmit?: () => any
    ref?: RefObject<any>
}

const KeyboardNumeric = ({ inputName, onValuesChange, onSubmit, ref }: IProps) => {
    const [inputValues, setInputVales] = useState<any>({});

    const keyboard = useRef<any>(null)

    useImperativeHandle(ref, () => ({
        onChangeInput(event: ChangeEvent<HTMLInputElement>) {
            const inputVal = event.target.value;

            let updatedInputObj = {
                ...inputValues,
                [event.target.name]: inputVal
            };

            setInputVales(updatedInputObj);
            onValuesChange(updatedInputObj)

            keyboard.current?.setInput(inputVal);
        },

        setInput(inputName: string, value: string) {
            keyboard.current?.setInput(value, inputName);
        },

        setValue(inputs: any) {
            keyboard.current?.replaceInput(inputs);
        }
    }));


    const onChangeAll = (inputs: any) => {
        setInputVales({ ...inputs });
        onValuesChange({ ...inputs })
    };

    const onKeyPress = (button: string) => {
        const existValue = { ...inputValues }

        const reset = Object.keys(existValue).reduce((acc: any, curr) => {
            if (existValue[curr] === null) return { ...acc, [curr]: null };
            if (typeof existValue[curr] === 'undefined') return { ...acc, [curr]: undefined };
            if (typeof existValue[curr] === 'boolean') return { ...acc, [curr]: false };
            if (typeof existValue[curr] === 'string') return { ...acc, [curr]: '' };
            if (typeof existValue[curr] === 'number') return { ...acc, [curr]: 0 };
            if (existValue[curr] instanceof Array) return { ...acc, [curr]: [] };
            if (typeof existValue[curr] === 'object') return { ...acc, [curr]: {} };
        }, {})

        if (button === "{lock}") {
            onChangeAll(reset)
            keyboard.current?.clearInput();
        }

        if (button === "{enter}") {
            onSubmit!()
        }
    };


    return (
        <Keyboard
            keyboardRef={r => (keyboard.current = r)}
            inputName={inputName}
            layoutName={'default'}
            onChangeAll={onChangeAll}
            onKeyPress={onKeyPress}
            theme={"hg-theme-default numeric"}
            layout={{
                default: [
                    "1 2 3",
                    "4 5 6",
                    "7 8 9",
                    "{bksp} 0 {enter}"
                ]
            }}
            buttonTheme={[
                {
                    class: "hg-delete",
                    buttons: "{bksp} {lock} {enter}"
                },
                {
                    class: "hg-at",
                    buttons: "@"
                },
                {
                    class: "hg-space",
                    buttons: "{space}"
                },
            ]}
            display={{
                "{bksp}": "⌫",
                "{lock}": "Clear",
                "{enter}": "Done",
                "{shift}": "shift",
                "{space}": "space",
            }}
        />
    );
};

export default KeyboardNumeric;
