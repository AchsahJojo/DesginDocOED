/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from "react";
import { useEffect, useState } from "react";
import {
	Button,
	Col,
	Container,
	FormFeedback,
	FormGroup,
	Input,
	Label,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Row,
} from "reactstrap";
import { FormattedMessage } from "react-intl";
import "../../styles/modal.css";
import { TrueFalseType } from "../../types/items";
import TooltipMarkerComponent from "../TooltipMarkerComponent";
import TooltipHelpComponent from "../../components/TooltipHelpComponent";
import {
	UnitRepresentType,
	DisplayableType,
	UnitType,
} from "../../types/redux/units";
import { tooltipBaseStyle } from "../../styles/modalStyle";
import { unitsApi } from "../../redux/api/unitsApi";
import { useTranslate } from "../../redux/componentHooks";
import {
	showSuccessNotification,
	showErrorNotification,
} from "../../utils/notifications";
import { LineGraphRates } from "../../types/redux/graph";
//import { number } from "prop-types";
// import { set } from "lodash";

/**
 * Defines the create unit modal form
 * @returns Unit create element
 */
export default function CreateUnitModalComponent() {
	const [submitCreateUnit] = unitsApi.useAddUnitMutation();
	const translate = useTranslate();

	const defaultValues = {
		name: "",
		identifier: "",
		typeOfUnit: UnitType.unit,
		unitRepresent: UnitRepresentType.quantity,
		displayable: DisplayableType.all,
		preferredDisplay: true,
		secInRate: 3600,
		suffix: "",
		note: "",
		// These two values are necessary but are not used.
		// The client code makes the id for the selected unit and default graphic unit be -99
		// so it can tell it is not yet assigned and do the correct logic for that case.
		// The units API expects these values to be undefined on call so that the database can assign their values.
		id: -99,
	};

	/* State */
	// Unlike EditUnitModalComponent, there are no props so we don't pass show and close via props.
	// Modal show
	const [showModal, setShowModal] = useState(false);
	const handleClose = () => {
		setShowModal(false);
		resetState();
	};
	const handleShow = () => setShowModal(true);

	// Handlers for each type of input change
	const [state, setState] = useState(defaultValues);

	const handleStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setState({ ...state, [e.target.name]: e.target.value });
	};

	const handleBooleanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setState({ ...state, [e.target.name]: JSON.parse(e.target.value) });
	};

	//const CUSTOM_INPUT = "";
	//create a new useState to keep track of the current drop option
	// ( drop dwon option you selected) or whatver text is insdie the text box
	//textbox: new state would be a number , the 2nd rate gonna contain either a standerd vakue or impossible value
	//check weeather that indciator exists, if yes then when you submit, you want to supply whats in ur state variable, ortheriwse whatver is in sec in rate
	//weather you show the textbox depends on the impossible variable,

	//The value of secInRate is set to Number(e.target.value). This means the function takes the value from the event's target (the input element), converts it to a number
	// (since input values are strings by default), and updates the secInRate property in the state with this numeric value.
	const handleSecInRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setState({ ...state, secInRate: Number(e.target.value) });
	};

	/* Create Unit Validation:
		Name cannot be blank
		Sec in Rate must be greater than zero
		If type of unit is suffix their must be a suffix
	*/
	const [validUnit, setValidUnit] = useState(false);
	useEffect(() => {
		setValidUnit(
			state.name !== "" &&
				state.secInRate > 0 &&
				(state.typeOfUnit !== UnitType.suffix || state.suffix !== "")
		);
	}, [state.name, state.secInRate, state.typeOfUnit, state.suffix]);
	/* End State */

	// Reset the state to default values
	const resetState = () => {
		setState(defaultValues);
	};

	// Unlike edit, we decided to discard inputs when you choose to leave the page. The reasoning is
	// that create starts from an empty template.

	// Submit
	const handleSubmit = () => {
		// Close modal first to avoid repeat clicks
		setShowModal(false);
		// Set default identifier as name if left blank
		state.identifier =
			!state.identifier || state.identifier.length === 0
				? state.name
				: state.identifier;
		// set displayable to none if unit is meter
		if (
			state.typeOfUnit == UnitType.meter &&
			state.displayable != DisplayableType.none
		) {
			state.displayable = DisplayableType.none;
		}
		// set unit to suffix if suffix is not empty
		if (state.typeOfUnit != UnitType.suffix && state.suffix != "") {
			state.typeOfUnit = UnitType.suffix;
		}
		// Add the new unit and update the store
		submitCreateUnit(state)
			.unwrap()
			.then(() => {
				showSuccessNotification(translate("unit.successfully.create.unit"));
			})
			.catch(() => {
				showErrorNotification(translate("unit.failed.to.create.unit"));
			});
		resetState();
	};

	const tooltipStyle = {
		...tooltipBaseStyle,
		tooltipCreateUnitView: "help.admin.unitcreate",
	};

	//made to loop thru the values in LineGraphRates to dertemin where if if is standerd value or not
	const rateInSecIsStandard = Object.values(LineGraphRates).includes(
		state.secInRate / 3600
	);

	return (
		<>
			{/* Show modal button */}
			<Button color="secondary" onClick={handleShow}>
				<FormattedMessage id="create.unit" />
			</Button>
			<Modal isOpen={showModal} toggle={handleClose} size="lg">
				<ModalHeader>
					<FormattedMessage id="create.unit" />
					<TooltipHelpComponent page="units-create" />
					<div style={tooltipStyle}>
						<TooltipMarkerComponent
							page="units-create"
							helpTextId={tooltipStyle.tooltipCreateUnitView}
						/>
					</div>
				</ModalHeader>
				{/* when any of the unit properties are changed call one of the functions. */}
				<ModalBody>
					<Container>
						<Row xs="1" lg="2">
							{/* Identifier input */}
							<Col>
								<FormGroup>
									<Label for="identifier">{translate("identifier")}</Label>
									<Input
										id="identifier"
										name="identifier"
										type="text"
										autoComplete="on"
										onChange={(e) => handleStringChange(e)}
										value={state.identifier}
									/>
								</FormGroup>
							</Col>
							{/* Name input */}
							<Col>
								<FormGroup>
									<Label for="name">{translate("name")}</Label>
									<Input
										id="name"
										name="name"
										type="text"
										autoComplete="on"
										onChange={(e) => handleStringChange(e)}
										value={state.name}
										invalid={state.name === ""}
									/>
									<FormFeedback>
										<FormattedMessage id="error.required" />
									</FormFeedback>
								</FormGroup>
							</Col>
						</Row>
						<Row xs="1" lg="2">
							{/* Type of unit input */}
							<Col>
								<FormGroup>
									<Label for="typeOfUnit">
										{translate("unit.type.of.unit")}
									</Label>
									<Input
										id="typeOfUnit"
										name="typeOfUnit"
										type="select"
										onChange={(e) => handleStringChange(e)}
										value={state.typeOfUnit}
										invalid={
											state.typeOfUnit != UnitType.suffix && state.suffix != ""
										}
									>
										{Object.keys(UnitType).map((key) => {
											return (
												<option
													value={key}
													key={key}
													disabled={
														state.suffix != "" && key != UnitType.suffix
													}
												>
													{translate(`UnitType.${key}`)}
												</option>
											);
										})}
									</Input>
									<FormFeedback>
										<FormattedMessage id="unit.type.of.unit.suffix" />
									</FormFeedback>
								</FormGroup>
							</Col>
							{/* Unit represent input */}
							<Col>
								<FormGroup>
									<Label for="unitRepresent">
										{translate("unit.represent")}
									</Label>
									<Input
										id="unitRepresent"
										name="unitRepresent"
										type="select"
										onChange={(e) => handleStringChange(e)}
										value={state.unitRepresent}
									>
										{Object.keys(UnitRepresentType).map((key) => {
											return (
												<option value={key} key={key}>
													{translate(`UnitRepresentType.${key}`)}
												</option>
											);
										})}
									</Input>
								</FormGroup>
							</Col>
						</Row>
						<Row xs="1" lg="2">
							{/* Displayable type input */}
							<Col>
								<FormGroup>
									<Label for="displayable">{translate("displayable")}</Label>
									<Input
										id="displayable"
										name="displayable"
										type="select"
										onChange={(e) => handleStringChange(e)}
										value={state.displayable}
										invalid={
											state.displayable != DisplayableType.none &&
											(state.typeOfUnit == UnitType.meter || state.suffix != "")
										}
									>
										{Object.keys(DisplayableType).map((key) => {
											return (
												<option
													value={key}
													key={key}
													disabled={
														(state.typeOfUnit == UnitType.meter ||
															state.suffix != "") &&
														key != DisplayableType.none
													}
												>
													{translate(`DisplayableType.${key}`)}
												</option>
											);
										})}
									</Input>
									<FormFeedback>
										{state.displayable !== DisplayableType.none &&
										state.typeOfUnit == UnitType.meter ? (
											<FormattedMessage id="error.displayable.meter" />
										) : (
											<FormattedMessage id="error.displayable.suffix.input" />
										)}
									</FormFeedback>
								</FormGroup>
							</Col>
							{/* Preferred display input */}
							<Col>
								<FormGroup>
									<Label for="preferredDisplay">
										{translate("unit.preferred.display")}
									</Label>
									<Input
										id="preferredDisplay"
										name="preferredDisplay"
										type="select"
										onChange={(e) => handleBooleanChange(e)}
									>
										{Object.keys(TrueFalseType).map((key) => {
											return (
												<option value={key} key={key}>
													{translate(`TrueFalseType.${key}`)}
												</option>
											);
										})}
									</Input>
								</FormGroup>
							</Col>
						</Row>
						<Row xs="1" lg="2">
							{/* Seconds in rate input */}
							<Col>
								<FormGroup>
									<Label for="secInRate">{translate("unit.sec.in.rate")}</Label>
									<Input
										id="secInRate"
										name="secInRate"
										type="select"
										onChange={(e) => handleSecInRateChange(e)}
										value={state.secInRate}
									>
										{Object.entries(LineGraphRates).map(
											([rateKey, rateValue]) => (
												<option value={rateValue * 3600} key={rateKey}>
													{translate(rateKey)}
												</option>
											)
										)}
										<option value={rateInSecIsStandard ? 0 : state.secInRate}>
											{translate("custom.value")}
										</option>
									</Input>
									{!rateInSecIsStandard && (
										<Input
											type="number"
											value={state.secInRate}
											onChange={(e) => handleSecInRateChange(e)}
											//placeholder={translate("sec.in.rate.enter")} // Assuming you have a placeholder translatiom
										/>
									)}
									<FormFeedback>
										<FormattedMessage
											id="error.greater"
											values={{ min: "0" }}
										/>
									</FormFeedback>
								</FormGroup>
							</Col>
							{/* Suffix input */}
							<Col>
								<FormGroup>
									<Label for="suffix">{translate("unit.suffix")}</Label>
									<Input
										id="suffix"
										name="suffix"
										type="text"
										autoComplete="off"
										onChange={(e) => handleStringChange(e)}
										value={state.suffix}
										invalid={
											state.typeOfUnit === UnitType.suffix &&
											state.suffix === ""
										}
									/>
									<FormFeedback>
										<FormattedMessage id="error.required" />
									</FormFeedback>
								</FormGroup>
							</Col>
						</Row>
						{/* Note input */}
						<FormGroup>
							<Label for="note">{translate("note")}</Label>
							<Input
								id="note"
								name="note"
								type="textarea"
								onChange={(e) => handleStringChange(e)}
								value={state.note}
							/>
						</FormGroup>
					</Container>
				</ModalBody>
				<ModalFooter>
					{/* Hides the modal */}
					<Button color="secondary" onClick={handleClose}>
						<FormattedMessage id="discard.changes" />
					</Button>
					{/* On click calls the function handleSaveChanges in this component */}
					<Button color="primary" onClick={handleSubmit} disabled={!validUnit}>
						<FormattedMessage id="save.all" />
					</Button>
				</ModalFooter>
			</Modal>
		</>
	);
}
