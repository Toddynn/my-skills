'use client';

import { LucideX } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '../../button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../dialog';
import { Field, FieldContent, FieldLabel, FieldLabelRequired } from '../../field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../../input-group';
import type { ConfirmModalProps } from './interfaces';

export function ConfirmModal({
	config: {
		title,
		description,
		cancelButtonProps,
		confirmButtonProps,
		confirmText = 'Confirmar',
		cancelText = 'Cancelar',
		icon,
		customActions,
		requireConfirmationText = false,
		compareTo = '',
		confirmationTextInputProps,
	},
	onConfirm,
	onCancel,
	inputValue,
	setInputValue,
	control,
}: ConfirmModalProps) {
	const isInputValid = useMemo(() => !requireConfirmationText || inputValue?.trim() === compareTo?.trim(), [compareTo, inputValue, requireConfirmationText]);

	return (
		<Dialog {...control}>
			<DialogContent className="sm:max-w-lg sm:min-w-lg w-full">
				<DialogHeader className="flex flex-col gap-2">
					{icon && icon}
					<DialogTitle className="text-lg font-medium">{title}</DialogTitle>
					{description && <p className="text-muted-foreground text-sm font-normal text-pretty text-ellipsis">{description}</p>}
				</DialogHeader>
				{requireConfirmationText && (
					<Field>
						<FieldLabel className="text-sm font-medium">
							Por favor, digite <strong className="text-destructive">{compareTo}</strong> para confirmar
							<FieldLabelRequired />
						</FieldLabel>
						<FieldContent>
							<InputGroup className="h-10">
								<InputGroupInput
									className="h-10"
									type="text"
									value={inputValue}
									onChange={(e) => setInputValue?.(e.target.value)}
									placeholder={confirmationTextInputProps?.placeholder || 'Digite aqui...'}
									{...confirmationTextInputProps}
								/>
								<InputGroupAddon align="inline-end">
									<Button variant="ghost" size="icon-xs" onClick={() => setInputValue?.('')}>
										<LucideX className="size-4" />
									</Button>
								</InputGroupAddon>
							</InputGroup>
						</FieldContent>
					</Field>
				)}
				<DialogFooter>
					{customActions ? (
						customActions(onConfirm, onCancel)
					) : (
						<>
							<Button onClick={onCancel} variant={'outline'} {...cancelButtonProps}>
								{cancelText}
							</Button>
							<Button onClick={onConfirm} {...confirmButtonProps} disabled={!isInputValid}>
								{confirmText}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
