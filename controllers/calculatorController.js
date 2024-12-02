const fs = require('fs')
const response = JSON.parse(fs.readFileSync('info.json', 'utf8'))

exports.calculate = (req, res) => {
	console.log('HELLO')
	const { day, month, year } = req.body
	const lang = req.body.lang

	const karmicTypologyResult = calculateKarmicTypology(day, month, year)
	const subtypeResult = calculateSubtype(new Date(year, month - 1, day))
	const markers = calculateContours(year, month, day)
	const contourDescriptions = findContourDescriptions(markers)
	const chakraValues = calculateChakraPercentages(year, month, day)
	const personalityTypeResult = response.personalityType[karmicTypologyResult]
	const vibrationResult = response.vibration[karmicTypologyResult]
	const triadaResult = response.triada[karmicTypologyResult]
	const typologyDescr =
		response.typologyDescriptions[karmicTypologyResult][lang]
	const subtypeDescr = response.subtypeDescriptions[subtypeResult][lang]
	const personTypeDescr =
		response.personalityDescriptions[personalityTypeResult[lang]][lang]
	const triadaDescr = response.triadaDescriptions[triadaResult[lang]][lang]
	const contourTempDescr =
		response.contourTempDescriptions[contourDescriptions[0].physicalDesc[lang]]

	const contourPersonDescr =
		response.contourPersonDescriptions[
			contourDescriptions[1].emotionalDesc[lang]
		]
	const contourIntellDescr =
		response.contourIntellDescriptions[
			contourDescriptions[2].intellectualDesc[lang]
		]

	const daySum = reduceToSingleDigit(day)
	const monthSum = reduceToSingleDigit(month)
	const yearSum = reduceToSingleDigit(year)
	// Объединение всех сумм
	var totalSum =
		daySum * 1000 +
		monthSum * 100 +
		yearSum * 10 +
		reduceToSingleDigit(daySum + monthSum + yearSum)

	var daySumTwo = reduceToTwoDigits(day)
	var monthSumTwo = reduceToTwoDigits(month)
	var yearSumTwo = reduceToTwoDigits(year)
	var totalSumTwo = daySumTwo + monthSumTwo + yearSumTwo

	var soulStageResult = ''
	if (totalSumTwo <= 7) {
		soulStageResult = response.soulStageName['Ремісник'][lang]
	} else if (totalSumTwo <= 14) {
		soulStageResult = response.soulStageName['Купець'][lang]
	} else if (totalSumTwo <= 21) {
		soulStageResult = response.soulStageName['Воїн'][lang]
	} else if (totalSumTwo <= 28) {
		soulStageResult = response.soulStageName['Медіум'][lang]
	} else if (totalSumTwo <= 35) {
		soulStageResult = response.soulStageName['Творець'][lang]
	} else if (totalSumTwo <= 42) {
		soulStageResult = response.soulStageName['Містик'][lang]
	} else if (totalSumTwo <= 49) {
		soulStageResult = response.soulStageName['Алхімік'][lang]
	}

	var soulStageDescr = response.soulStageDescriptions[soulStageResult][lang]

	var totalChakras = Object.values(chakraValues).reduce(
		(total, chakra) => total + chakra,
		0
	)
	const chakraSahasraraSum = totalChakras / 6
	var roundedSahasrara = Math.round(chakraSahasraraSum)

	const energy = (totalChakras / 499) * 100
	var roundedEnergy = Math.round(energy)

	const sumChakrasW =
		chakraValues.svadhistana + chakraValues.anahata + chakraValues.adjna
	const resultW = (sumChakrasW / 297) * 100
	var roundedW = Math.round(resultW)

	const sumChakrasM =
		chakraValues.muladhara + chakraValues.manipura + chakraValues.vishudha
	const resultM = (sumChakrasM / 297) * 100
	var roundedM = Math.round(resultM)

	var difference = Math.abs(sumChakrasW - sumChakrasM)
	var muladharaValue = chakraValues.muladhara
	var wantcanValue = difference * muladharaValue

	const sumChakrasMaterial =
		chakraValues.muladhara + chakraValues.svadhistana + chakraValues.manipura
	const resultMaterial = (sumChakrasMaterial * 100) / 297
	var roundedresultMaterial = Math.round(resultMaterial)

	const sumChakrasSpiritual =
		chakraValues.anahata + chakraValues.vishudha + chakraValues.adjna
	const resultSpiritual = (sumChakrasSpiritual * 100) / 297
	var roundedresultSpiritual = Math.round(resultSpiritual)

	// Считаем эфирное, ментально, астральное
	const sumEthereal = chakraValues.muladhara + chakraValues.svadhistana
	const resultEthereal = (sumEthereal / 198) * 100
	var roundedEthereal = Math.round(resultEthereal)

	const sumAstral = chakraValues.manipura + chakraValues.anahata
	const resultAstral = (sumAstral / 198) * 100
	var roundedAstral = Math.round(resultAstral)

	const sumMental = chakraValues.vishudha + chakraValues.adjna
	const resultMental = (sumMental / 198) * 100
	var roundedMental = Math.round(resultMental)

	const secondMarkerData = displayMarkersReactivity(markers)
	const typeReactDescription =
		response.typeReactDescriptions[secondMarkerData.emotionalType[lang]][lang]

	const sumChakrasLogic = chakraValues.vishudha + chakraValues.manipura
	const resultLogic = (sumChakrasLogic / 198) * 100
	var roundedLogic = Math.round(resultLogic)

	const sumChakrasIntuit = chakraValues.anahata + chakraValues.adjna
	const resultIntuit = (sumChakrasIntuit / 198) * 100
	var roundedIntuit = Math.round(resultIntuit)

	var sumDigits = calculateSumDigits(day, month)
	var sumGenusTypology = calculateSumGenusTypology(
		sumDigits,
		karmicTypologyResult
	)

	// Считаем past. Складываем день и месяц рождения
	const dayMonthString =
		(day < 10 ? '0' + day : day.toString()) +
		(month < 10 ? '0' + month : month.toString())
	// Вычисляем произведение дня и месяца рождения на год рождения
	const product = parseInt(dayMonthString, 10) * year
	const productString = product.toString()
	var firstDigit = parseInt(productString[0])

	var sumTaskPast2 = firstDigit + karmicTypologyResult
	while (sumTaskPast2 >= 10) {
		sumTaskPast2 = Math.floor(sumTaskPast2 / 10) + (sumTaskPast2 % 10)
	}

	const periodsData = {}

	for (var i = 1; i < productString.length; i++) {
		// Получаем текущую цифру произведения
		const digit = parseInt(productString[i])

		const blockId = `period-${2 * i - 1}`
		const lowerBlockId = `lower-period-${2 * i - 1}`
		const periodsBlockId = 'lower-period-' + (2 * i - 1) + '-text-full'

		const periodsDescr =
			response.periodsLifeDescriptions[digit.toString()][lang]

		// Добавляем данные о текущей цифре и её расшифровке в объект periodsData
		periodsData[blockId] = digit
		periodsData[lowerBlockId] = digit
		periodsData[periodsBlockId] = periodsDescr
	}

	const periodsDataLower = {}

	for (var i = 1; i <= 11; i += 2) {
		const currentValue = parseInt(periodsData[`period-${i}`])
		var result = currentValue + karmicTypologyResult
		while (result >= 10) {
			result = Math.floor(result / 10) + (result % 10)
		}
		periodsDataLower[`period-${i + 1}`] = result
		periodsDataLower[`lower-period-${i + 1}`] = result
	}

	// Считаем now
	var sumNow =
		parseInt(productString[0]) +
		parseInt(productString[productString.length - 1])
	while (sumNow >= 10) {
		sumNow = Math.floor(sumNow / 10) + (sumNow % 10)
	}
	var sumNow2 = sumNow + karmicTypologyResult
	while (sumNow2 >= 10) {
		sumNow2 = Math.floor(sumNow2 / 10) + (sumNow2 % 10)
	}

	var sumFamily = sumNow + sumDigits
	while (sumFamily >= 10) {
		sumFamily = Math.floor(sumFamily / 10) + (sumFamily % 10)
	}
	var sumFamily2 = sumFamily + karmicTypologyResult
	while (sumFamily2 >= 10) {
		sumFamily2 = Math.floor(sumFamily2 / 10) + (sumFamily2 % 10)
	}

	var sumVectorLife = 0
	for (var i = 0; i < productString.length; i++) {
		sumVectorLife += parseInt(productString[i])
	}
	while (sumVectorLife >= 10) {
		sumVectorLife = Math.floor(sumVectorLife / 10) + (sumVectorLife % 10)
	}

	// Создаем набор для хранения уникальных цифр кода успеха
	var uniqueDigitsCodeSuccess = new Set(totalSum.toString())
	var uniqueDescriptions = []

	// Для каждой уникальной цифры извлекаем описание и добавляем его в массив
	uniqueDigitsCodeSuccess.forEach(function (digit) {
		uniqueDescriptions.push(response.codeSuccessDescriptions[digit][lang])
	})
	const successText =
		response.codeTamplateText[lang] + uniqueDescriptions.join('<br>')

	let chakraDescrSahasrara = ''
	if (roundedSahasrara < 40) {
		chakraDescrSahasrara = response.chakrasDescriptions.sahasraraBelow[lang]
	} else if (roundedSahasrara >= 40 && roundedSahasrara <= 59) {
		chakraDescrSahasrara = response.chakrasDescriptions.sahasraraNormal[lang]
	} else {
		chakraDescrSahasrara = response.chakrasDescriptions.sahasraraAbove[lang]
	}

	const chakras = [
		'adjna',
		'vishudha',
		'anahata',
		'manipura',
		'svadhistana',
		'muladhara',
	]

	const chakraDescriptions = {}

	chakras.forEach(chakra => {
		const chakraValue = parseInt(chakraValues[chakra])
		// console.log(`Значение чакры ${chakra}: ${chakraValue}`)
		let chakraDescription = ''

		if (response.chakrasDescriptions[chakra]) {
			if (chakraValue < 40 && response.chakrasDescriptions[chakra].Below) {
				chakraDescription = response.chakrasDescriptions[chakra].Below[lang]
			} else if (
				chakraValue >= 40 &&
				chakraValue <= 59 &&
				response.chakrasDescriptions[chakra].Normal
			) {
				chakraDescription = response.chakrasDescriptions[chakra].Normal[lang]
			} else if (response.chakrasDescriptions[chakra].Above) {
				chakraDescription = response.chakrasDescriptions[chakra].Above[lang]
			}
		} else {
			chakraDescription = 'Описания нет'
		}

		chakraDescriptions[chakra] = chakraDescription
	})

	var sexpontdesc =
		wantcanValue < 1000
			? response.sexPotentialDescriptions.lessThan1000[lang]
			: response.sexPotentialDescriptions.greaterThanOrEqual1000[lang]

	let wantCanDescr = ''

	if (
		difference === muladharaValue ||
		Math.abs(difference - muladharaValue) <= 12
	) {
		// Если can, want равны, или почти до 12 выводим "Рівне, або майже рівне Хочу і Можу"
		wantCanDescr = response.canWantDescriptions.equalNearlyEqualWantCan[lang]
	} else if (muladharaValue <= 20 && difference <= 50) {
		// Если can до 20, а want до 50, выводим "Якщо Можу мало, а Хочу середньо"
		wantCanDescr = response.canWantDescriptions.canLitteWantMedium[lang]
	} else if (
		(muladharaValue <= 20 && difference <= 100) ||
		difference > muladharaValue
	) {
		// Если can до 20, а want до 100, выводим "Якщо Можу мало, а Хочу багато"
		wantCanDescr = response.canWantDescriptions.canLitteWantLot[lang]
	} else if (difference <= 20 && muladharaValue <= 50) {
		// Если want до 20, а can до 50, выводим "Якщо Хочу мало, а Можу середньо"
		wantCanDescr = response.canWantDescriptions.wantLitteCanMedium[lang]
	} else if (
		(difference <= 20 && muladharaValue <= 90) ||
		muladharaValue > difference
	) {
		// Если want до 20, а can до 90, выводим "Якщо Хочу мало, а Можу багато"
		wantCanDescr = response.canWantDescriptions.wantLitteCanLot[lang]
	} else if (
		muladharaValue >= 100 &&
		difference >= 100 &&
		difference > muladharaValue
	) {
		// Если can до 100, а want больше 100, выводим "Якщо Можу і Хочу багато, але Хочу перевищує"
		wantCanDescr = response.canWantDescriptions.canWantLotWantMore[lang]
	} else if (
		muladharaValue >= 90 &&
		muladharaValue <= 99 &&
		difference >= 100 &&
		muladharaValue > difference
	) {
		// Если can от 90 - 99, а want до 100, и can больше 90, выводим "Якщо Можу і Хочу багато, але Можу перевищує"
		wantCanDescr = response.canWantDescriptions.canWantLotCanMore[lang]
	} else {
		console.error('Недостаточно данных для вывода расшифровки')
	}

	let descriptionWM = ''
	var differenceWM = Math.abs(roundedW - roundedM)
	// console.log('FM:', differenceWM)
	if (differenceWM <= 12) {
		descriptionWM = response.femaleMaleDescriptions.fmaverage[lang]
	} else {
		descriptionWM =
			roundedW > roundedM
				? response.femaleMaleDescriptions.female[lang]
				: response.femaleMaleDescriptions.male[lang]
	}

	const materialDescr = response.materialDescriptions.material[lang]
	const spiritualDescr = response.materialDescriptions.spiritual[lang]

	const etherDescription =
		roundedEthereal <= 39
			? response.thinBodiesDescriptions.ether.etherBelow[lang]
			: response.thinBodiesDescriptions.ether.etherAbove[lang]

	const astralDescription =
		roundedAstral <= 39
			? response.thinBodiesDescriptions.astral.astralBelow[lang]
			: response.thinBodiesDescriptions.astral.astralAbove[lang]

	const mentalDescription =
		roundedMental <= 39
			? response.thinBodiesDescriptions.mental.mentalBelow[lang]
			: response.thinBodiesDescriptions.mental.mentalAbove[lang]

	const logicdesc =
		roundedLogic <= 39
			? response.ligicAndIntuitDescriptions.logicBelow[lang]
			: response.ligicAndIntuitDescriptions.logicAbove[lang]

	const intuitdesc =
		roundedIntuit <= 39
			? response.ligicAndIntuitDescriptions.intuitBelow[lang]
			: response.ligicAndIntuitDescriptions.intuitAbove[lang]

	const taskLifeGenusDescr =
		response.taskLifeGenusDescriptions[sumDigits].description[lang]
	const taskLifeGenusDescrTitle = response.taskLifeGenusDescriptions[
		sumDigits
	].title[lang].replace(
		'{sum}',
		`<span class="color-plum">${sumGenusTypology}</span>`
	)
	const taskLifeParentsDescr =
		response.taskLifeParentsDescriptions[sumFamily][lang]
	const taskLifeVectorDescr =
		response.taskLifeVectorDescriptions[sumVectorLife][lang]
	const taskLifeNowDescr = response.taskLifeNowDescriptions[sumNow][lang]
	const taskLifePastDescr = response.taskLifePastDescriptions[firstDigit][lang]

	res.json({
		typology: karmicTypologyResult,
		subtype: subtypeResult,
		temperament: contourDescriptions[0].physicalDesc,
		character: contourDescriptions[1].emotionalDesc,
		intelligence: contourDescriptions[2].intellectualDesc,
		person_type: personalityTypeResult,
		vibration: vibrationResult,
		triada: triadaResult,
		soulStage: soulStageResult,
		code_success: totalSum,
		chakras: chakraValues,
		sahasrara: roundedSahasrara,
		energy: roundedEnergy,
		yin: roundedW,
		yang: roundedM,
		want: difference,
		can: muladharaValue,
		sex_potential: wantcanValue,
		material: roundedresultMaterial,
		spiritual: roundedresultSpiritual,
		ether: roundedEthereal,
		astral: roundedAstral,
		mental: roundedMental,
		logic: roundedLogic,
		intuit: roundedIntuit,
		ego: secondMarkerData.me,
		alter: secondMarkerData.we,
		emotionalType: secondMarkerData.emotionalType,
		typeReactDescription: typeReactDescription,
		genus: sumDigits,
		genus_2: sumGenusTypology,
		parents: sumFamily,
		parents_2: sumFamily2,
		vector: sumVectorLife,
		now: sumNow,
		now_2: sumNow2,
		past: firstDigit,
		past_2: sumTaskPast2,
		period_1: periodsData['period-1'],
		period_3: periodsData['period-3'],
		period_5: periodsData['period-5'],
		period_7: periodsData['period-7'],
		period_9: periodsData['period-9'],
		period_11:
			periodsData['period-11'] !== undefined ? periodsData['period-11'] : '-',
		periods_desc_1: periodsData['lower-period-1-text-full'],
		periods_desc_3: periodsData['lower-period-3-text-full'],
		periods_desc_5: periodsData['lower-period-5-text-full'],
		periods_desc_7: periodsData['lower-period-7-text-full'],
		periods_desc_9: periodsData['lower-period-9-text-full'],
		periods_desc_11: periodsData['lower-period-11-text-full'],
		period_2: periodsDataLower['period-2'],
		period_4: periodsDataLower['period-4'],
		period_6: periodsDataLower['period-6'],
		period_8: periodsDataLower['period-8'],
		period_10: periodsDataLower['period-10'],
		period_12: periodsDataLower['period-12']
			? periodsDataLower['period-12']
			: '-',

		typologyDescription: typologyDescr,
		subtypeDescription: subtypeDescr,
		personalityDescription: personTypeDescr,
		triadaDescription: triadaDescr,
		soulStageDescription: soulStageDescr,
		code_successDescription: successText,
		contourTempDescription: contourTempDescr,
		contourPersonDescription: contourPersonDescr,
		contourIntellDescription: contourIntellDescr,
		chakraDescriptionSahasrara: chakraDescrSahasrara,
		chakraDescriptions: chakraDescriptions,
		sex_potentialDescription: sexpontdesc,
		wantcanDescription: wantCanDescr,
		yiniangDescription: descriptionWM,
		materialDescription: materialDescr,
		spiritualDescription: spiritualDescr,
		etherDescriptions: etherDescription,
		astralDescriptions: astralDescription,
		mentalDescriptions: mentalDescription,
		logicDescription: logicdesc,
		intuitDescription: intuitdesc,
		taskLifeGenusDescription: taskLifeGenusDescr,
		taskLifeGenusDescriptionTitle: taskLifeGenusDescrTitle,
		taskLifeParentsDescription: taskLifeParentsDescr,
		taskLifeVectorDescription: taskLifeVectorDescr,
		taskLifeNowDescription: taskLifeNowDescr,
		taskLifePastDescription: taskLifePastDescr,
	})
};


function calculateKarmicTypology(day, month, year) {
	const birthday = new Date(year, month - 1, day)
	var now = new Date()

	var age = now.getFullYear() - birthday.getFullYear()

	if (
		now.getMonth() < birthday.getMonth() ||
		(now.getMonth() === birthday.getMonth() &&
			now.getDate() < birthday.getDate())
	) {
		age--
	}

	function karmicTypology(date) {
		const dateString = date
			.toLocaleDateString('en-US', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
			})
			.replace(/\//g, '')

		const num = dateString.split('').map(Number)
		let summ = num.reduce((acc, currentNumber) => acc + currentNumber, 0)

		while (summ > 9) {
			summ = summ
				.toString()
				.split('')
				.map(Number)
				.reduce((acc, currentNumber) => acc + currentNumber, 0)
		}

		return summ
	}

	const karmicTypologyResult = karmicTypology(birthday)
	return karmicTypologyResult
}

function calculateSubtype(birthday) {
	const day = birthday.getDate().toString().padStart(2, '0')
	let firstTwoDigitsSum = parseInt(day[0], 10) + parseInt(day[1], 10)

	while (firstTwoDigitsSum > 9) {
		firstTwoDigitsSum = firstTwoDigitsSum
			.toString()
			.split('')
			.map(Number)
			.reduce((acc, currentNumber) => acc + currentNumber, 0)
	}

	return firstTwoDigitsSum
}

// Функция для нахождения маркеров
function findMarkers(data, value) {
	const entry = data.find(
		entry => entry.year === value || entry.month === value
	)
	if (entry) {
		return [entry.marker1, entry.marker2, entry.marker3]
	}
	return [0, 0, 0]
}

// Функция для вычисления контуров
function calculateContours(year, month, day) {
	// Находим маркеры для года, месяца и дня
	const yearMarkers = findMarkers(response.yearData, year)
	const monthMarkers = findMarkers(response.monthData, month)
	const dayMonth = new Date(year, month, 0).getDate()
	const dayMarkers = [dayMonth - day, dayMonth - day, dayMonth - day] // Для дня маркеры одинаковые
	// Суммируем маркеры
	const sumMarkers = yearMarkers.map(
		(m, i) => m + monthMarkers[i] + dayMarkers[i]
	)

	// Вычитаем полный цикл, если необходимо
	const modMarkers = sumMarkers.map((markerSum, i) => {
		if (i === 0) {
			if (markerSum % 23 === 0) {
				return 23
			} else {
				return markerSum % 23
			}
		} else if (i === 1) {
			if (markerSum % 28 === 0) {
				return 28
			} else {
				return markerSum % 28
			}
		} else if (i === 2) {
			if (markerSum % 33 === 0) {
				return 33
			} else {
				return markerSum % 33
			}
		} else {
			return 0
		}
	})
	return modMarkers
}

// Функция для поиска описаний контуров по маркерам
function findContourDescriptions(markers) {
	return markers.map(marker => {
		const contour = response.contourData.find(c => c.marker === marker)
		return contour
			? contour
			: {
					physicalDesc: 'Unknown',
					emotionalDesc: 'Unknown',
					intellectualDesc: 'Unknown',
			  }
	})
}

function calculateChakraPercentages(year, month, day) {
	const markers = calculateContours(year, month, day)

	const chakraValues = {
		adjna: 0,
		vishudha: 0,
		anahata: 0,
		manipura: 0,
		svadhistana: 0,
		muladhara: 0,
	}

	markers.forEach((marker, index) => {
		const chakraData = response.contourData.find(
			entry => entry.marker === marker
		)

		if (!chakraData) {
			console.error('Данные для чакры не найдены для маркера:', marker)
			return
		}

		switch (index) {
			case 0:
				chakraValues.muladhara = chakraData.physical
					? parseInt(chakraData.physical.split('-')[0])
					: 0
				chakraValues.svadhistana = chakraData.physical
					? parseInt(chakraData.physical.split('-')[1])
					: 0
				break
			case 1:
				chakraValues.manipura = chakraData.emotional
					? parseInt(chakraData.emotional.split('-')[0])
					: 0
				chakraValues.anahata = chakraData.emotional
					? parseInt(chakraData.emotional.split('-')[1])
					: 0
				break
			case 2:
				chakraValues.vishudha = chakraData.intellectual
					? parseInt(chakraData.intellectual.split('-')[0])
					: 0
				chakraValues.adjna = chakraData.intellectual
					? parseInt(chakraData.intellectual.split('-')[1])
					: 0
				break
			default:
				break
		}
	})

	return chakraValues
}

// Функция для отображения реактивности маркеров
function displayMarkersReactivity(markers) {
	// Находим второй маркер пользователя
	const secondMarker = markers[1]
	// console.log('Получаем второй маркер:', secondMarker)

	// Возвращаем данные в виде объекта
	const secondMarkerData = response.markersReactivity.find(
		entry => entry.marker === secondMarker
	)
	return secondMarkerData
}

// Функция для суммирования цифр числа до однозначного числа
function reduceToSingleDigit(number) {
	var sum = 0
	while (number > 0) {
		var digit = number % 10
		if (digit !== 0) {
			sum += digit
		}
		number = Math.floor(number / 10)
	}
	if (sum >= 10) {
		return reduceToSingleDigit(sum)
	}
	return sum
}

function reduceToTwoDigits(number) {
	var sum = 0
	while (number > 0) {
		sum += number % 10
		number = Math.floor(number / 10)
	}
	return sum
}

function calculateSumDigits(day, month) {
	let sumDigits = 0
	if (day >= 10) {
		sumDigits += Math.floor(day / 10) + (day % 10)
	} else if (day !== 0) {
		sumDigits += day
	}
	if (month >= 10) {
		sumDigits += Math.floor(month / 10) + (month % 10)
	} else if (month !== 0) {
		sumDigits += month
	}

	while (sumDigits >= 10) {
		sumDigits = Math.floor(sumDigits / 10) + (sumDigits % 10)
	}

	return sumDigits
}

function calculateSumGenusTypology(sumDigits, karmicTypologyResult) {
	let sumGenusTypology = sumDigits + karmicTypologyResult

	while (sumGenusTypology >= 10) {
		sumGenusTypology =
			Math.floor(sumGenusTypology / 10) + (sumGenusTypology % 10)
	}

	return sumGenusTypology
}





exports.getInfo = (req, res) => {
	res.status(200).send(response);
}