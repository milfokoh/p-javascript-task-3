'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано оба метода и tryLater
 */
const isStar = true;

const objSchedule = {
    'ПН': {},
    'ВТ': {},
    'СР': {},
};
const mapMutation = new Map();
const mapSchedule = [];


function checkPlanning(object, day, workingHours) {
    let arrFrom = [];
    let arrTo = [];    
    for (const [key, value] of Object.entries(object)) {
      if (Array.isArray(value)) {
        value.forEach(item => {
            let fromDay = item.from.split(' ')[0];
            let toDay = item.to.split(' ')[0];
            let fromHour = item.from.split(' ')[1];
            let toHour = item.to.split(' ')[1];
            if ( fromHour.slice(-2) !== workingHours.from.slice(-2)) { 
                let diffHours = 5 - parseInt(fromHour.slice(-2));
                fromHour =  fromHour.split(':');
                fromHour[0] = parseInt(fromHour[0])+ diffHours;
                fromHour[1] = fromHour[1].slice(0,3) + (parseInt(fromHour[1].slice(-1)) + diffHours);
                toHour =  toHour.split(':');
                toHour[0] = parseInt(toHour[0])+ diffHours;
                toHour[1] = toHour[1].slice(0,3) + (parseInt(toHour[1].slice(-1)) + diffHours);
                fromHour = fromHour.join(':');
                toHour = toHour.join(':');        
            }
            if ( fromDay == day && toDay == day) {
                arrFrom.push(fromHour);
                arrTo.push(toHour);
            }
            if (fromDay == day && toDay !== day) {
                mapMutation.set(toDay, toHour);
            }            
        });
      }
    }
    return [arrFrom, arrTo, mapMutation];
}

function fillingScheduleObject(object, day, schedule, workingHours) {
    let [arrFrom, arrTo, mapMutation] = checkPlanning(schedule, day, workingHours);

    arrFrom.sort((a,b) => {
        return parseInt(a.slice(0,2) + a.slice(3,5)) - parseInt(b.slice(0,2) + b.slice(3,5))
    });    
    object[day].startWork = arrFrom[0];
    
    arrTo.sort((a,b) => {
        return parseInt(a.slice(0,2) + a.slice(3,5)) - parseInt(b.slice(0,2) + b.slice(3,5))
    });
    object[day].endWork = arrTo[arrTo.length - 1];
    
    if (mapMutation.has(day)) {
        let value = mapMutation.get(day);
        object[day].startBeforeWork = (arrFrom[0].slice(0,2) * 60 + arrFrom[0].slice(3,5) * 1) - (value.slice(0,2) * 60 + value.slice(3,5) * 1);
    }
    else {
        object[day].startBeforeWork = (arrFrom[0].slice(0,2) * 60 + arrFrom[0].slice(3,5) * 1) - (workingHours.from.slice(0,2) * 60 + workingHours.from.slice(3,5) * 1);
    }
    object[day].startAfterWork = (workingHours.to.slice(0,2) * 60 + workingHours.to.slice(3,5) * 1) - (arrTo[arrTo.length -1].slice(0,2) * 60 + arrTo[arrTo.length -1].slice(3,5) * 1);
}

function goFillingScheduleObject(schedule, workingHours) {
    fillingScheduleObject(objSchedule, 'ПН', schedule, workingHours);
    fillingScheduleObject(objSchedule, 'ВТ', schedule, workingHours);
    fillingScheduleObject(objSchedule, 'СР', schedule, workingHours);
}

function preExists(object, duration) {
    for (const [key, value] of Object.entries(object)) {
        if (value.startBeforeWork == duration) {
            let time = value.startWork;
            time = parseInt(time.slice(0,2) * 60 + time.slice(3,5) * 1) - value.startBeforeWork;
            time = `${parseInt(time / 60)}:${(time % 60).toString().padStart(2, '0')}`;
            mapSchedule.push([key, value.startBeforeWork, time].join(" "));
        }  
        if (value.startAfterWork == duration) {
            let time = value.endWork;
            time = parseInt(time.slice(0,2) * 60 + time.slice(3,5) * 1);
            time = `${parseInt(time / 60)}:${(time % 60).toString().padStart(2, '0')}`;
            mapSchedule.push([key, value.startAfterWork, time].join(" "));
        }
        if (value.startBeforeWork > duration) {
            let time = value.startWork;
            time = parseInt(time.slice(0,2) * 60 + time.slice(3,5) * 1) - value.startBeforeWork;
            time = `${parseInt(time / 60)}:${(time % 60).toString().padStart(2, '0')}`;
            mapSchedule.push([key, value.startBeforeWork,time].join(" "));
        }  
        if (value.startAfterWork > duration) {
            let differenceTime = value.endWork;
            differenceTime  = parseInt(differenceTime.slice(0,2) * 60 + differenceTime.slice(3,5) * 1) + (value.startAfterWork - duration);
            differenceTime = `${parseInt(differenceTime / 60)}:${(differenceTime % 60).toString().padStart(2, '0')}`;
            let time = value.endWork;
            time = parseInt(time.slice(0,2) * 60 + time.slice(3,5) * 1);
            time = `${parseInt(time / 60)}:${(time % 60).toString().padStart(2, '0')}`;
            mapSchedule.push([key, duration, time].join(" "));
            mapSchedule.push([key, duration, differenceTime].join(" "));
                        
        }
    }
    
}


/**
 * @param {Object} schedule – Расписание Банды
 * @param {Number} duration - Время на ограбление в минутах
 * @param {Object} workingHours – Время работы банка
 * @param {String} workingHours.from – Время открытия, например, "10:00+5"
 * @param {String} workingHours.to – Время закрытия, например, "18:00+5"
 * @returns {Object}
 */
function getAppropriateMoment(schedule, duration, workingHours) {
    console.info(schedule, duration, workingHours);
    goFillingScheduleObject(schedule, workingHours);
    preExists(objSchedule, duration);
    let count = 0;

    return {

        /**
         * Найдено ли время
         * @returns {Boolean}
         */
        exists: function () {            
            if (mapSchedule.length !== 0) return true;
            else return false;
        },

        /**
         * Возвращает отформатированную строку с часами для ограбления
         * Например, "Начинаем в %HH:%MM (%DD)" -> "Начинаем в 14:59 (СР)"
         * @param {String} template
         * @returns {String}
         */
        format: function (template) {
            let array = mapSchedule;
            let value = array[count];
            if (mapSchedule.length !== count) {                
                let [date, timeDuration, time] = value.split(" ");
                template = template.replace('%DD', date);
                template = template.replace('%HH', time.slice(0,2));
                template = template.replace('%MM', time.slice(-2));
                return template;
            }
            else {
                template = '';
                return template;
            }
        },

        /**
         * Попробовать найти часы для ограбления позже [*]
         * @star
         * @returns {Boolean}
         */
        tryLater: function () {
            if (mapSchedule[count + 1] !== undefined) {
                count ++;
                console.info(true);
            }
            else console.info(false);
            
        }        
    };
}

module.exports = {
    objSchedule,
    mapMutation,
    mapSchedule,
    checkPlanning,
    fillingScheduleObject,
    goFillingScheduleObject,    
    getAppropriateMoment,

    isStar
};
