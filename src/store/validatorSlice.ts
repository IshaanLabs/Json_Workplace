export interface ValidationError {
  line?: number
  column?: number
  message: string
  friendlyMessage: string
  hint?: string
}

export interface ValidatorState {
  errors: ValidationError[]
  setErrors: (errors: ValidationError[]) => void
  clearErrors: () => void
}

export const createValidatorSlice = (
  set: (fn: (state: ValidatorState) => Partial<ValidatorState>) => void
): ValidatorState => ({
  errors: [],
  setErrors: (errors) => set(() => ({ errors })),
  clearErrors: () => set(() => ({ errors: [] })),
})

/**
 * Translate a raw JSON.parse error message into a developer-friendly
 * description with an optional contextual hint.
 */
export function toFriendlyMessage(rawMessage: string): { friendly: string; hint?: string } {
  const msg = rawMessage.toLowerCase()

  if (msg.includes('unexpected token }') || msg.includes("expected property name or '}'")) {
    return {
      friendly: 'Unexpected closing brace }',
      hint: 'Check for a trailing comma on the last property, or a missing opening {.',
    }
  }
  if (msg.includes('unexpected token ]') || msg.includes("expected ']'")) {
    return {
      friendly: 'Unexpected closing bracket ]',
      hint: 'Check for a trailing comma on the last element, or a missing opening [.',
    }
  }
  if (msg.includes('unexpected end of json') || msg.includes('unexpected end of input') || msg.includes('end of json input')) {
    return {
      friendly: 'Unexpected end of input',
      hint: 'The JSON is incomplete — check for an unclosed { or [ that needs a closing } or ].',
    }
  }
  if (msg.includes("expected ','")) {
    return {
      friendly: 'Missing comma between values',
      hint: 'JSON requires a comma between each property or array element.',
    }
  }
  if (msg.includes("expected ':'")) {
    return {
      friendly: 'Missing colon after property key',
      hint: 'Object properties must have the form "key": value.',
    }
  }
  if (msg.includes('unexpected token') && (msg.includes("'") || msg.includes('single quote'))) {
    return {
      friendly: 'Single quotes are not valid in JSON',
      hint: 'Use double quotes " for all strings and keys.',
    }
  }
  if (msg.includes('unexpected token')) {
    // Try to extract the token from the message for context
    const tokenMatch = /unexpected token ['"]?([^'"]+)['"]?/i.exec(rawMessage)
    const token = tokenMatch ? ` "${tokenMatch[1]}"` : ''
    return {
      friendly: `Unexpected token${token}`,
      hint: 'This character is not valid at this position. Check for unquoted keys, JavaScript-style comments, or non-JSON values like undefined.',
    }
  }
  if (msg.includes('invalid number') || msg.includes('bad number')) {
    return {
      friendly: 'Invalid number literal',
      hint: 'Check for extra dots, leading zeros (e.g. 007), or non-numeric characters in a number value.',
    }
  }
  if (msg.includes('duplicate key')) {
    return {
      friendly: 'Duplicate object key',
      hint: 'JSON parsers may reject or silently discard duplicate keys. Remove or rename the duplicate.',
    }
  }
  if (msg.includes('circular')) {
    return {
      friendly: 'Circular reference detected',
      hint: 'JSON cannot represent circular references.',
    }
  }

  return { friendly: rawMessage }
}
