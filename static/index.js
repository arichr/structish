/*!
 * Translate Python notations of C structures into English.
 * Copyright (C) 2023  Arisu Wonderland
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const chars = {
    endianness: {
        '<': 'Little-endian',
        '>': 'Big-endian',
        '!': 'Internet (Big-endian)',
        '@': 'Native-endian',
        '=': 'Native-endian'
    },
    types: {
        'x': 'a pad byte',
        'c': 'a character',
        'b': 'a signed character',
        'B': 'an unsigned character',
        '?': 'a boolean',
        'h': 'a short',
        'H': 'an unsigned short',
        'i': 'an integer',
        'I': 'an unsigned integer',
        'l': 'a long',
        'L': 'an unsigned long',
        'q': 'a long long',
        'Q': 'an unsigned long long',
        'n': 'a signed size_t',
        'N': 'a size_t',
        'e': 'a float',
        'f': 'a float',
        'd': 'a double',
        's': 'a string',
        'p': 'a string',
        'P': 'a pointer'
    },
    plurals: {
        'x': 'pad bytes',
        'c': 'characters',
        'b': 'signed characters',
        'B': 'unsigned characters',
        '?': 'booleans',
        'h': 'short',
        'H': 'unsigned short',
        'i': 'integers',
        'I': 'unsigned integers',
        'l': 'long',
        'L': 'unsigned long',
        'q': 'long long',
        'Q': 'unsigned long long',
        'n': 'signed size_t',
        'N': 'size_t',
        'e': 'floats',
        'f': 'floats',
        'd': 'double',
        's': 'strings',
        'p': 'strings',
        'P': 'pointers'
    }
}

Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)];
}

const genExample = () => {
    let isAmountPresent = false;

    let example = Object.keys(chars.endianness).random();
    let fields_n = Math.floor(Math.random() * 3) + 1;

    while (fields_n > 0) {
        // Allow an amount to be specified only once or never.
        if (!isAmountPresent && Math.floor(Math.random() * 1.5)) {
            example += Math.floor(Math.random() * 20);
            isAmountPresent = true;
        }

        example += Object.keys(chars.types).random();
        fields_n--;
    }

    return example;
}

const exampleLinkEl = document.getElementById('example');
const inputEl = document.getElementsByTagName('input')[0];
const resultContainerEl = document.getElementById('translation');

const translateFrom = () => {
    let translation = '<span id="endianness">';

    // isNaN() returns true even if the number is enclosed in spaces.
    // NOTE: Your browser may not have .replaceAll()
    // (see https://caniuse.com/mdn-javascript_builtins_string_replaceall)
    let input = inputEl.value.replaceAll(' ', '');
    if (!input)
        return Error('Empty prompt.');

    let possibleEndianness = chars.endianness[input.charAt(0)];
    if (possibleEndianness) {
        translation += possibleEndianness;
        input = input.slice(1);
    } else {
        translation += chars.endianness['@'];
    }

    translation += '</span> structure of ';

    let fields = [];
    let isNumberPresent = false;
    for (const char of input) {
        if (isNumberPresent && isNaN(char)) {
            fields[fields.length - 1].type = char;
        } else if (isNumberPresent) {
            fields[fields.length - 1].amount += char;
        } else {
            let obj = {amount: '', type: ''};
            if (isNaN(char))
                obj.type = char
            else
                obj.amount = char;

            fields.push(obj);
        }
        isNumberPresent = !isNaN(char);
    }

    if (isNumberPresent)
        return Error('Unexpected number at the end.');

    if (!fields.length)
        return Error('No structure fields provided.');

    let fieldIndex = -1;
    for (let field of fields) {
        fieldIndex++;

        field.amount = Math.max(Number(field.amount), 1);
        if (!chars.types[field.type])
            return Error('Invalid prompt.');

        // Check if the next field has the same type
        let nextField = fields[fieldIndex + 1];
        if (nextField && chars.types[nextField.type] == chars.types[field.type]) {
            nextField.amount = Math.max(Number(nextField.amount), 1) + field.amount;
            continue;
        }

        if (field.amount == 1) {
            translation += `<i>${chars.types[field.type]}</i>`;
        } else {
            translation += `<i>${field.amount} ${chars.plurals[field.type]}</i>`;
        }

        if (fieldIndex + 2 == fields.length)
            translation += ' and '
        else if (fieldIndex + 1 < fields.length)
            translation += ', ';
    }

    return translation + '.';
};

const processInput = () => {
    let translation = translateFrom();
    console.log(translation);
    if (translation.message)
        translation = `<span id="error">Error:</span> ${translation.message}`;

    resultContainerEl.innerHTML = translation;
};

exampleLinkEl.innerText = genExample();
exampleLinkEl.addEventListener('click', () => {
    inputEl.value = exampleLinkEl.innerText;
    processInput();
});

inputEl.addEventListener('input', processInput);

// Ensure the input value is clear after refreshing.
inputEl.value = '';
