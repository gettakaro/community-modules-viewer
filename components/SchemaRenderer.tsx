'use client';

import { useState } from 'react';

interface JsonSchemaProperty {
  type?: string | string[];
  title?: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enum?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  anyOf?: any[];
  properties?: Record<string, JsonSchemaProperty>;
  items?: JsonSchemaProperty;
  required?: string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  'x-component'?: string;
}

interface JsonSchema extends JsonSchemaProperty {
  $schema?: string;
  additionalProperties?: boolean;
}

interface SchemaRendererProps {
  /** JSON schema string to render */
  schema: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the schema expanded by default */
  defaultExpanded?: boolean;
}

/**
 * SchemaRenderer component for displaying JSON schemas in a user-friendly format
 * Parses JSON schema and displays properties as structured cards with type information
 */
export function SchemaRenderer({
  schema,
  className = '',
  defaultExpanded = false,
}: SchemaRendererProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Parse the schema
  const parsedSchema = (() => {
    try {
      if (!schema || schema.trim() === '') {
        return null;
      }
      return JSON.parse(schema) as JsonSchema;
    } catch (error) {
      console.warn('Failed to parse JSON schema:', error);
      return null;
    }
  })();

  if (!parsedSchema) {
    return null;
  }

  // Check if schema is empty or trivial
  const isEmptySchema =
    !parsedSchema.properties ||
    Object.keys(parsedSchema.properties).length === 0;

  if (isEmptySchema) {
    return (
      <div className={`card-takaro bg-takaro-card ${className}`}>
        <div className="flex items-center gap-3 text-takaro-text-muted">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm">
            No configuration properties defined. This module uses default
            settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-takaro-text-primary">
          Configuration Properties (
          {Object.keys(parsedSchema.properties || {}).length})
        </h4>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-takaro-text-muted hover:text-takaro-text-secondary transition-colors"
        >
          {isExpanded ? 'Collapse' : 'Expand'} properties
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {Object.entries(parsedSchema.properties || {}).map(
            ([key, property]) => (
              <PropertyCard
                key={key}
                name={key}
                property={property}
                isRequired={parsedSchema.required?.includes(key) || false}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

interface PropertyCardProps {
  name: string;
  property: JsonSchemaProperty;
  isRequired: boolean;
  level?: number;
}

function PropertyCard({
  name,
  property,
  isRequired,
  level = 0,
}: PropertyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get type information
  const getTypeInfo = (prop: JsonSchemaProperty) => {
    if (prop.enum) {
      return {
        type: 'enum',
        displayType: 'enum',
        color: 'bg-purple-100 text-purple-800',
      };
    }
    if (prop.anyOf) {
      return {
        type: 'union',
        displayType: 'union',
        color: 'bg-indigo-100 text-indigo-800',
      };
    }
    if (Array.isArray(prop.type)) {
      return {
        type: prop.type.join(' | '),
        displayType: prop.type.join(' | '),
        color: 'bg-gray-100 text-gray-800',
      };
    }

    const type = prop.type || 'any';
    const colorMap: Record<string, string> = {
      string: 'bg-green-100 text-green-800',
      number: 'bg-blue-100 text-blue-800',
      integer: 'bg-blue-100 text-blue-800',
      boolean: 'bg-orange-100 text-orange-800',
      array: 'bg-pink-100 text-pink-800',
      object: 'bg-yellow-100 text-yellow-800',
      any: 'bg-gray-100 text-gray-800',
    };

    return { type, displayType: type, color: colorMap[type] || colorMap.any };
  };

  const typeInfo = getTypeInfo(property);
  const hasNested = property.properties || property.items;

  return (
    <div
      className={`card-takaro border-l-4 ${isRequired ? 'border-l-takaro-accent' : 'border-l-takaro-border'} ${level > 0 ? 'ml-4' : ''}`}
    >
      <div className="space-y-2">
        {/* Property header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-medium text-takaro-text-primary">
                {name}
              </span>
              {isRequired && (
                <span className="text-xs text-takaro-accent font-medium">
                  *
                </span>
              )}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}
              >
                {typeInfo.displayType}
              </span>
              {property['x-component'] && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-takaro-info/20 text-takaro-info">
                  {property['x-component']}
                </span>
              )}
            </div>

            {property.title && (
              <h5 className="text-sm font-medium text-takaro-text-primary mb-1">
                {property.title}
              </h5>
            )}

            {property.description && (
              <p className="text-sm text-takaro-text-secondary">
                {property.description}
              </p>
            )}
          </div>

          {hasNested && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-takaro-text-muted hover:text-takaro-text-secondary transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Property details */}
        <div className="space-y-2">
          {/* Default value */}
          {property.default !== undefined && (
            <DefaultValueDisplay defaultValue={property.default} />
          )}

          {/* Enum values */}
          {property.enum && <EnumDisplay values={property.enum} />}

          {/* Union types */}
          {property.anyOf && <UnionDisplay options={property.anyOf} />}

          {/* Validation constraints */}
          <ValidationConstraints property={property} />

          {/* Array items */}
          {property.type === 'array' && property.items && isExpanded && (
            <div className="space-y-2">
              <h6 className="text-xs font-medium text-takaro-text-primary">
                Array Items:
              </h6>
              <PropertyCard
                name="item"
                property={property.items}
                isRequired={false}
                level={level + 1}
              />
            </div>
          )}

          {/* Object properties */}
          {property.properties && isExpanded && (
            <div className="space-y-2">
              <h6 className="text-xs font-medium text-takaro-text-primary">
                Object Properties:
              </h6>
              <div className="space-y-2">
                {Object.entries(property.properties).map(
                  ([propName, propSchema]) => (
                    <PropertyCard
                      key={propName}
                      name={propName}
                      property={propSchema}
                      isRequired={
                        property.required?.includes(propName) || false
                      }
                      level={level + 1}
                    />
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EnumDisplay({ values }: { values: any[] }) {
  const [showAll, setShowAll] = useState(false);
  const displayValues = showAll ? values : values.slice(0, 10);
  const hasMore = values.length > 10;

  return (
    <div className="space-y-2">
      <div className="text-xs text-takaro-text-muted">
        Allowed values ({values.length}):
      </div>
      <div className="flex flex-wrap gap-1">
        {displayValues.map((value, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-takaro-card border border-takaro-border"
          >
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </span>
        ))}
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs text-takaro-text-muted hover:text-takaro-text-secondary border border-dashed border-takaro-border"
          >
            {showAll ? 'Show less' : `... +${values.length - 10} more`}
          </button>
        )}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function UnionDisplay({ options }: { options: any[] }) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-takaro-text-muted">Union type (one of):</div>
      <div className="space-y-1">
        {options.map((option, index) => (
          <div
            key={index}
            className="text-xs bg-takaro-card px-2 py-1 rounded border border-takaro-border"
          >
            {option.const ? (
              <span>
                <strong>{option.const}</strong>
                {option.title && (
                  <span className="text-takaro-text-muted">
                    {' '}
                    - {option.title}
                  </span>
                )}
              </span>
            ) : (
              <code>{JSON.stringify(option)}</code>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ValidationConstraints({ property }: { property: JsonSchemaProperty }) {
  const constraints = [];

  if (property.minimum !== undefined)
    constraints.push(`min: ${property.minimum}`);
  if (property.maximum !== undefined)
    constraints.push(`max: ${property.maximum}`);
  if (property.minLength !== undefined)
    constraints.push(`minLength: ${property.minLength}`);
  if (property.maxLength !== undefined)
    constraints.push(`maxLength: ${property.maxLength}`);
  if (property.minItems !== undefined)
    constraints.push(`minItems: ${property.minItems}`);
  if (property.maxItems !== undefined)
    constraints.push(`maxItems: ${property.maxItems}`);
  if (property.uniqueItems) constraints.push('uniqueItems');

  if (constraints.length === 0) return null;

  return (
    <div className="text-xs text-takaro-text-muted">
      Constraints: {constraints.join(', ')}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DefaultValueDisplay({ defaultValue }: { defaultValue: any }) {
  const [showFull, setShowFull] = useState(false);

  // Check if it's an array with many items
  if (Array.isArray(defaultValue)) {
    if (defaultValue.length === 0) {
      return (
        <div className="text-xs">
          <span className="text-takaro-text-muted">Default: </span>
          <code className="bg-takaro-card px-1 py-0.5 rounded text-takaro-text-primary">
            [] (empty array)
          </code>
        </div>
      );
    }

    if (defaultValue.length > 3) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-takaro-text-muted">Default:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-takaro-accent/20 text-takaro-accent">
              Array of {defaultValue.length} items
            </span>
            <button
              onClick={() => setShowFull(!showFull)}
              className="text-xs text-takaro-text-muted hover:text-takaro-text-secondary transition-colors"
            >
              {showFull ? 'Hide details' : 'Show details'}
            </button>
          </div>

          {showFull ? (
            <div className="space-y-2">
              <ArrayPreview items={defaultValue} />
            </div>
          ) : (
            <ArrayPreview
              items={defaultValue.slice(0, 2)}
              showMore={defaultValue.length - 2}
            />
          )}
        </div>
      );
    }
  }

  // For non-arrays or small arrays, use the original display
  const displayValue =
    typeof defaultValue === 'string'
      ? defaultValue.length > 100
        ? `${defaultValue.substring(0, 100)}...`
        : defaultValue
      : JSON.stringify(defaultValue);

  return (
    <div className="text-xs">
      <span className="text-takaro-text-muted">Default: </span>
      <code className="bg-takaro-card px-1 py-0.5 rounded text-takaro-text-primary">
        {displayValue}
      </code>
    </div>
  );
}

function ArrayPreview({
  items,
  showMore,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  showMore?: number;
}) {
  return (
    <div className="space-y-1">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-takaro-card border border-takaro-border rounded p-2 text-xs"
        >
          {typeof item === 'object' && item !== null ? (
            <ObjectPreview obj={item} />
          ) : (
            <code className="text-takaro-text-primary">
              {typeof item === 'string' && item.length > 50
                ? `"${item.substring(0, 50)}..."`
                : JSON.stringify(item)}
            </code>
          )}
        </div>
      ))}
      {showMore && showMore > 0 && (
        <div className="text-xs text-takaro-text-muted italic">
          ... and {showMore} more items
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ObjectPreview({ obj }: { obj: any }) {
  const keys = Object.keys(obj);
  const displayKeys = keys.slice(0, 3);
  const hasMore = keys.length > 3;

  return (
    <div className="space-y-1">
      {displayKeys.map((key) => {
        const value = obj[key];
        let displayValue;

        if (typeof value === 'string' && value.length > 30) {
          displayValue = `"${value.substring(0, 30)}..."`;
        } else if (Array.isArray(value)) {
          displayValue = `[${value.length} items]`;
        } else if (typeof value === 'object' && value !== null) {
          displayValue = `{${Object.keys(value).length} props}`;
        } else {
          displayValue = JSON.stringify(value);
        }

        return (
          <div key={key} className="flex items-start gap-2">
            <span className="font-mono text-takaro-accent font-medium">
              {key}:
            </span>
            <span className="text-takaro-text-primary">{displayValue}</span>
          </div>
        );
      })}
      {hasMore && (
        <div className="text-takaro-text-muted italic">
          ... and {keys.length - displayKeys.length} more properties
        </div>
      )}
    </div>
  );
}

export default SchemaRenderer;
