// This file is automatically generated by the Open Roberta Lab.

#include <math.h>
#include <RobertaFunctions.h>   // Open Roberta library
#include <ArduinoSTL.h>
#include <list>
#include <NEPODefs.h>

RobertaFunctions rob;

std::list<double> ___item;
double ___item2;
int _led_L = 13;
void setup()
{
    Serial.begin(9600); 
    pinMode(_led_L, OUTPUT);
    ___item = {0, 0, 0};
    ___item2 = 0;
}

void loop()
{
    ___item2 = _getListElementByIndex(___item, 0);
    ___item2 = _getListElementByIndex(___item, ___item.size() - 1 - 0);
    ___item2 = _getListElementByIndex(___item, 0);
    ___item2 = _getListElementByIndex(___item, ___item.size() - 1);
    ___item2 = _getListElementByIndex(___item, 0 /* absolutely random number */);
    ___item2 = _getAndRemoveListElementByIndex(___item, 0);
    ___item2 = _getAndRemoveListElementByIndex(___item, ___item.size() - 1 - 0);
    ___item2 = _getAndRemoveListElementByIndex(___item, 0);
    ___item2 = _getAndRemoveListElementByIndex(___item, ___item.size() - 1);
    ___item2 = _getAndRemoveListElementByIndex(___item, 0 /* absolutely random number */);
    _removeListElementByIndex(___item, 0);
    _removeListElementByIndex(___item, ___item.size() - 1 - 0);
    _removeListElementByIndex(___item, 0);
    _removeListElementByIndex(___item, ___item.size() - 1);
    _removeListElementByIndex(___item, 0 /* absolutely random number */);
    _setListElementByIndex(___item, 0, 0);
    _setListElementByIndex(___item, ___item.size() - 1 - 0, 0);
    _setListElementByIndex(___item, 0, 0);
    _setListElementByIndex(___item, ___item.size() - 1, 0);
    _setListElementByIndex(___item, 0 /* absolutely random number */, 0);
    _insertListElementBeforeIndex(___item, 0, 0);
    _insertListElementBeforeIndex(___item, ___item.size() - 1 - 0, 0);
    _insertListElementBeforeIndex(___item, 0, 0);
    ___item.push_back(0);
    _insertListElementBeforeIndex(___item, 0 /* absolutely random number */, 0);
}
